import { ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { ISODate, Person } from "@/backend/schema";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingCard } from "@/components/common/LoadingCard";
import { formatWon, getExpenseAmountInWon } from "@/features/home/spendingSummary";

type ReceiveFragmentProps = {
  snapshot: BackendSnapshot | null;
  targetReceiver: Person | null;
  onReceiveExpense: (expenseId: number, debtorId: number) => Promise<void> | void;
};

type ReceiveExpense = {
  id: string;
  name: string;
  date: ISODate;
  cost: number;
  debtor: Person;
  confirmed: boolean;
};

export function ReceiveFragment({
  snapshot,
  targetReceiver,
  onReceiveExpense
}: ReceiveFragmentProps) {
  const [confirmingAction, setConfirmingAction] = useState<{
    expenseId: string;
    debtorId: number;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const expenseGroups = useMemo(() => {
    if (!snapshot || !targetReceiver) {
      return [];
    }

    return getReceiveExpenseGroups(snapshot, targetReceiver);
  }, [snapshot, targetReceiver]);

  const receiveExpense = async (expenseId: string, debtorId: number) => {
    if (isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      await onReceiveExpense(Number(expenseId), debtorId);
    } finally {
      setIsConfirming(false);
      setConfirmingAction(null);
    }
  };
  const confirmingExpense = expenseGroups
    .flatMap((group) => group.expenses)
    .find(
      (expense) =>
        expense.id === confirmingAction?.expenseId &&
        expense.debtor.id === confirmingAction.debtorId
    );

  return (
    <div className="grid gap-5 px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      {!snapshot && <LoadingCard />}

      {snapshot && expenseGroups.length === 0 && (
        <EmptyState message="모든 돈을 받았어요" />
      )}

      {expenseGroups.map((group) => (
        <section className="rounded-[1.75rem] bg-white p-5" key={group.debtor.id}>
          <h2 className="whitespace-pre-line text-[24px] font-black leading-[1.18] tracking-normal text-[#111827]">
            {group.debtor.name}에게{"\n"}
            {formatWon(group.total)}원을 받아야 해요.
          </h2>

          <div className="mt-5 divide-y divide-[#eef1f4]">
            {group.expenses.map((expense) => {
              return (
                <article className="flex items-center gap-3 py-4" key={expense.id}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f2f6ff] text-[#2f6df6]">
                    <ReceiptText className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold text-[#111827]">
                      {expense.name}
                    </h3>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                      {formatKoreanDate(expense.date)} · {formatWon(expense.cost)}원
                    </p>
                  </div>
                  <button
                    className={[
                      "flex min-w-[4.5rem] shrink-0 items-center justify-center rounded-full px-3.5 py-2 text-[13px] font-bold transition disabled:cursor-not-allowed",
                      expense.confirmed
                        ? "bg-[#111827] text-white"
                        : "bg-[#eef1f4] text-[#8a94a3]"
                    ].join(" ")}
                    type="button"
                    disabled={!expense.confirmed}
                    onClick={() => {
                      setConfirmingAction({
                        expenseId: expense.id,
                        debtorId: expense.debtor.id
                      });
                    }}
                  >
                    {expense.confirmed ? "받았어요" : "송금 전"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {confirmingExpense && (
        <ConfirmationDialog
          title="돈을 받았다고 표시할까요?"
          description={`${confirmingExpense.debtor.name}에게 ${formatWon(
            confirmingExpense.cost
          )}원을 받은 것으로 표시해요.`}
          confirmLabel={isConfirming ? "표시 중" : "표시하기"}
          isPending={isConfirming}
          onCancel={() => setConfirmingAction(null)}
          onConfirm={() => {
            void receiveExpense(confirmingExpense.id, confirmingExpense.debtor.id);
          }}
        />
      )}
    </div>
  );
}

function getReceiveExpenseGroups(snapshot: BackendSnapshot, targetReceiver: Person) {
  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  const debtorsByExpenseId = snapshot.expenseDebtors.reduce(
    (debtors, expenseDebtor) => {
      const expenseDebtors = debtors.get(expenseDebtor.expense) ?? [];
      expenseDebtors.push(expenseDebtor);
      debtors.set(expenseDebtor.expense, expenseDebtors);

      return debtors;
    },
    new Map<number, typeof snapshot.expenseDebtors>()
  );
  const expenses: ReceiveExpense[] = [];

  for (const expense of snapshot.expenses) {
    if (expense.payer !== targetReceiver.id) {
      continue;
    }

    const debtors = debtorsByExpenseId.get(expense.id) ?? [];

    if (debtors.length === 0) {
      continue;
    }

    const amount = getExpenseAmountInWon(expense) / debtors.length;

    for (const expenseDebtor of debtors) {
      if (expenseDebtor.debtor === targetReceiver.id) {
        continue;
      }

      if (expenseDebtor.settlementStatus === "SETTLED") {
        continue;
      }

      const debtor = peopleById.get(expenseDebtor.debtor);

      if (!debtor) {
        continue;
      }

      expenses.push({
        id: String(expense.id),
        name: expense.name,
        date: expense.date,
        cost: amount,
        debtor,
        confirmed: expenseDebtor.settlementStatus === "SETTLING"
      });
    }
  }

  const groupsByDebtorId = expenses.reduce((groups, expense) => {
    const group = groups.get(expense.debtor.id) ?? {
      debtor: expense.debtor,
      total: 0,
      expenses: [] as ReceiveExpense[]
    };

    group.total += expense.cost;
    group.expenses.push(expense);
    groups.set(expense.debtor.id, group);

    return groups;
  }, new Map<number, { debtor: Person; total: number; expenses: ReceiveExpense[] }>());

  return Array.from(groupsByDebtorId.values())
    .map((group) => ({
      ...group,
      expenses: group.expenses.sort((left, right) => Number(right.id) - Number(left.id))
    }))
    .sort((left, right) => right.total - left.total);
}

function formatKoreanDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
}

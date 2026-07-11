import { ReceiptText } from "lucide-react";
import { useMemo } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { ISODate, Person } from "@/backend/schema";
import { LoadingCard } from "@/components/common/LoadingCard";
import { formatWon, getExpenseAmountInWon } from "@/features/home/spendingSummary";

type SendFragmentProps = {
  snapshot: BackendSnapshot | null;
  targetSender: Person | null;
  onSendExpense: (expenseId: number, debtorId: number) => void;
};

type SendExpense = {
  id: string;
  name: string;
  date: ISODate;
  cost: number;
  payer: Person;
  confirmed: boolean;
};

export function SendFragment({
  snapshot,
  targetSender,
  onSendExpense
}: SendFragmentProps) {
  const targetSenderId = targetSender?.id ?? null;
  const expenseGroups = useMemo(() => {
    if (!snapshot || !targetSender) {
      return [];
    }

    return getSendExpenseGroups(snapshot, targetSender);
  }, [snapshot, targetSender]);

  return (
    <div className="grid gap-5 px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      {!snapshot && <LoadingCard />}

      {snapshot && expenseGroups.length === 0 && (
        <p className="rounded-[1.25rem] bg-white p-5 text-[15px] font-semibold text-[#8a94a3]">
          보낼 돈이 없어요.
        </p>
      )}

      {expenseGroups.map((group) => (
        <section className="rounded-[1.75rem] bg-white p-5" key={group.payer.id}>
          <h2 className="whitespace-pre-line text-[24px] font-black leading-[1.18] tracking-normal text-[#111827]">
            {group.payer.name}에게{"\n"}
            {formatWon(group.total)}원을 보내야 해요.
          </h2>

          <div className="mt-5 divide-y divide-[#eef1f4]">
            {group.expenses.map((expense) => (
              <article className="flex items-center gap-3 py-4" key={expense.id}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff1f1] text-[#dc2626]">
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
                    "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-bold transition",
                    expense.confirmed
                      ? "bg-[#eef1f4] text-[#8a94a3]"
                      : "bg-[#111827] text-white"
                  ].join(" ")}
                  type="button"
                  disabled={expense.confirmed}
                  onClick={() => {
                    if (targetSenderId !== null) {
                      onSendExpense(Number(expense.id), targetSenderId);
                    }
                  }}
                >
                  {expense.confirmed ? "송금 확인중" : "송금했어요"}
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function getSendExpenseGroups(snapshot: BackendSnapshot, targetSender: Person) {
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
  const expenses: SendExpense[] = [];

  for (const expense of snapshot.expenses) {
    if (expense.payer === targetSender.id) {
      continue;
    }

    const debtors = debtorsByExpenseId.get(expense.id) ?? [];
    const targetDebtor = debtors.find((debtor) => debtor.debtor === targetSender.id);

    if (!targetDebtor) {
      continue;
    }

    if (targetDebtor.settlementStatus === "SETTLED") {
      continue;
    }

    const payer = peopleById.get(expense.payer);

    if (!payer) {
      continue;
    }

    const cost = getExpenseAmountInWon(expense) / debtors.length;

    expenses.push({
      id: String(expense.id),
      name: expense.name,
      date: expense.date,
      cost,
      payer,
      confirmed: targetDebtor.settlementStatus === "SETTLING"
    });
  }

  const groupsByPayerId = expenses.reduce((groups, expense) => {
    const group = groups.get(expense.payer.id) ?? {
      payer: expense.payer,
      total: 0,
      expenses: [] as SendExpense[]
    };

    group.total += expense.cost;
    group.expenses.push(expense);
    groups.set(expense.payer.id, group);

    return groups;
  }, new Map<number, { payer: Person; total: number; expenses: SendExpense[] }>());

  return Array.from(groupsByPayerId.values())
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

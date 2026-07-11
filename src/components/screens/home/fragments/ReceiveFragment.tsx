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
  title: string;
  description: string | null;
  date: ISODate;
  cost: number;
  debtor: Person;
  confirmed: boolean;
  isExiting?: boolean;
  isGroupExiting?: boolean;
};

type ExitingReceiveExpense = ReceiveExpense & {
  groupIndex: number;
  expenseIndex: number;
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
  const [recentlySettledExpense, setRecentlySettledExpense] =
    useState<ExitingReceiveExpense | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const expenseGroups = useMemo(() => {
    if (!snapshot || !targetReceiver) {
      return [];
    }

    return getReceiveExpenseGroups(snapshot, targetReceiver);
  }, [snapshot, targetReceiver]);
  const visibleExpenseGroups = useMemo(() => {
    if (!recentlySettledExpense) {
      return expenseGroups;
    }

    const hasExpense = expenseGroups.some((group) =>
      group.expenses.some(
        (expense) =>
          getReceiveExpenseKey(expense) === getReceiveExpenseKey(recentlySettledExpense)
      )
    );

    if (hasExpense) {
      return expenseGroups;
    }

    const nextGroups = expenseGroups.map((group) => {
      if (group.debtor.id !== recentlySettledExpense.debtor.id) {
        return group;
      }

      const expenses = [...group.expenses];
      expenses.splice(
        Math.min(recentlySettledExpense.expenseIndex, expenses.length),
        0,
        recentlySettledExpense
      );

      return {
        ...group,
        total: group.total + recentlySettledExpense.cost,
        expenses
      };
    });

    if (
      nextGroups.some((group) => group.debtor.id === recentlySettledExpense.debtor.id)
    ) {
      return nextGroups;
    }

    const groups = [...nextGroups];
    groups.splice(Math.min(recentlySettledExpense.groupIndex, groups.length), 0, {
      debtor: recentlySettledExpense.debtor,
      total: recentlySettledExpense.cost,
      expenses: [recentlySettledExpense]
    });

    return groups;
  }, [expenseGroups, recentlySettledExpense]);

  const receiveExpense = async (expenseId: string, debtorId: number) => {
    if (isConfirming) {
      return;
    }

    const expenseToSettle = findReceiveExpensePosition(
      expenseGroups,
      expenseId,
      debtorId
    );

    setIsConfirming(true);

    try {
      await onReceiveExpense(Number(expenseId), debtorId);
      if (expenseToSettle) {
        setRecentlySettledExpense({
          ...expenseToSettle.expense,
          groupIndex: expenseToSettle.groupIndex,
          expenseIndex: expenseToSettle.expenseIndex,
          isExiting: false
        });
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setRecentlySettledExpense((currentExpense) =>
              currentExpense &&
              getReceiveExpenseKey(currentExpense) ===
                getReceiveExpenseKey(expenseToSettle.expense)
                ? { ...currentExpense, isExiting: true }
                : currentExpense
            );
          });
        });
        window.setTimeout(() => {
          setRecentlySettledExpense((currentExpense) =>
            currentExpense &&
            getReceiveExpenseKey(currentExpense) ===
              getReceiveExpenseKey(expenseToSettle.expense)
              ? { ...currentExpense, isGroupExiting: true }
              : currentExpense
          );
        }, 320);
        window.setTimeout(() => {
          setRecentlySettledExpense((currentExpense) =>
            currentExpense &&
            getReceiveExpenseKey(currentExpense) ===
              getReceiveExpenseKey(expenseToSettle.expense)
              ? null
              : currentExpense
          );
        }, 680);
      }
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

      {snapshot && visibleExpenseGroups.length === 0 && (
        <EmptyState message="모든 돈을 받았어요" />
      )}

      {visibleExpenseGroups.map((group) => {
        const isGroupExiting =
          group.expenses.length === 1 &&
          Boolean(group.expenses[0]?.isExiting) &&
          Boolean(group.expenses[0]?.isGroupExiting);

        return (
          <section
            className={[
              "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out",
              isGroupExiting
                ? "grid-rows-[0fr] -translate-y-1 opacity-0"
                : "grid-rows-[1fr] translate-y-0 opacity-100"
            ].join(" ")}
            key={group.debtor.id}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="rounded-[1.75rem] bg-white p-5">
                <h2 className="whitespace-pre-line text-[24px] font-black leading-[1.18] tracking-normal text-[#111827]">
                  {group.debtor.name}에게{"\n"}
                  {formatWon(group.total)}원을 받아야 해요.
                </h2>

                <div className="mt-5 divide-y divide-[#eef1f4]">
                  {group.expenses.map((expense) => {
                    return (
                      <article
                        className={[
                          "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out",
                          expense.isExiting
                            ? "grid-rows-[0fr] -translate-y-1 opacity-0"
                            : "grid-rows-[1fr] translate-y-0 opacity-100"
                        ].join(" ")}
                        key={getReceiveExpenseKey(expense)}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="flex items-center gap-3 py-4">
                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f2f6ff] text-[#2f6df6]">
                              <ReceiptText className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-[15px] font-bold text-[#111827]">
                                {expense.title}
                              </h3>
                              {expense.description && (
                                <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[#6b7280]">
                                  {expense.description}
                                </p>
                              )}
                              <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                                {formatKoreanDate(expense.date)} ·{" "}
                                {formatWon(expense.cost)}원
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
                              disabled={!expense.confirmed || expense.isExiting}
                              onClick={() => {
                                setConfirmingAction({
                                  expenseId: expense.id,
                                  debtorId: expense.debtor.id
                                });
                              }}
                            >
                              {expense.confirmed ? "받았어요" : "송금 전"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })}

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

function getReceiveExpenseKey(expense: Pick<ReceiveExpense, "debtor" | "id">) {
  return `${expense.id}:${expense.debtor.id}`;
}

function findReceiveExpensePosition(
  expenseGroups: ReturnType<typeof getReceiveExpenseGroups>,
  expenseId: string,
  debtorId: number
) {
  for (const [groupIndex, group] of expenseGroups.entries()) {
    const expenseIndex = group.expenses.findIndex(
      (expense) => expense.id === expenseId && expense.debtor.id === debtorId
    );

    if (expenseIndex !== -1) {
      return {
        expense: group.expenses[expenseIndex],
        groupIndex,
        expenseIndex
      };
    }
  }

  return null;
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
        title: expense.title,
        description: expense.description,
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

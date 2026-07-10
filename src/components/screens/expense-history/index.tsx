import { ReceiptText } from "lucide-react";
import { useMemo } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { BackButton } from "@/components/common/BackButton";
import { LoadingCard } from "@/components/common/LoadingCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  formatDollar,
  formatWon,
  getExpenseListItems
} from "@/features/home/spendingSummary";

type ExpenseHistoryScreenProps = {
  snapshot: BackendSnapshot | null;
  onBack: () => void;
};

type ExpenseListItem = ReturnType<typeof getExpenseListItems>[number];

export function ExpenseHistoryScreen({ snapshot, onBack }: ExpenseHistoryScreenProps) {
  const expenses = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return getExpenseListItems(snapshot);
  }, [snapshot]);
  const expenseGroups = useMemo(() => groupExpensesByDate(expenses), [expenses]);

  return (
    <div className="min-h-screen px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      <ScreenHeader title="공금 사용 내역" />

      <section>
        {!snapshot && <LoadingCard />}

        {snapshot && expenses.length === 0 && (
          <p className="rounded-[1.25rem] bg-[#f7f8fa] p-5 text-[15px] font-semibold text-[#8a94a3]">
            아직 등록된 지출이 없어요.
          </p>
        )}

        {expenseGroups.length > 0 && (
          <div className="grid gap-6">
            {expenseGroups.map((group) => (
              <section key={group.date}>
                <h2 className="sticky top-24 z-[1] bg-[#f2f4f6]/95 py-2 text-[14px] font-bold text-[#6b7280] backdrop-blur">
                  {group.dateLabel}
                </h2>
                <div className="divide-y divide-[#eef1f4]">
                  {group.expenses.map((expense) => (
                    <article className="flex items-center gap-3 py-4" key={expense.id}>
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-full ${
                          expense.isSettled
                            ? "bg-[#f2f6ff] text-[#2f6df6]"
                            : "bg-[#fff1f1] text-[#dc2626]"
                        }`}
                      >
                        <ReceiptText className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[16px] font-bold text-[#111827]">
                          {expense.name}
                        </h3>
                        <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                          {expense.payerName} 결제 · {expense.debtorCount}명 사용 · $
                          {formatDollar(expense.cost)}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-[16px] font-bold text-[#111827]">
                        {formatWon(expense.realCost)}원
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <BackButton onClick={onBack} />
    </div>
  );
}

function groupExpensesByDate(expenses: ExpenseListItem[]) {
  return expenses.reduce<
    {
      date: string;
      dateLabel: string;
      expenses: ExpenseListItem[];
    }[]
  >((groups, expense) => {
    const currentGroup = groups.at(-1);

    if (currentGroup?.date === expense.date) {
      currentGroup.expenses.push(expense);
      return groups;
    }

    groups.push({
      date: expense.date,
      dateLabel: expense.dateLabel,
      expenses: [expense]
    });

    return groups;
  }, []);
}

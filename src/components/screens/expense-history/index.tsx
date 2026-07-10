import { ReceiptText } from "lucide-react";
import { useMemo } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { BackButton } from "@/components/common/BackButton";
import { LoadingCard } from "@/components/common/LoadingCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { formatWon, getExpenseListItems } from "@/features/home/spendingSummary";

type ExpenseHistoryScreenProps = {
  snapshot: BackendSnapshot | null;
  onBack: () => void;
};

export function ExpenseHistoryScreen({ snapshot, onBack }: ExpenseHistoryScreenProps) {
  const expenses = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return getExpenseListItems(snapshot);
  }, [snapshot]);

  return (
    <div className="min-h-screen px-5 pb-32 pt-32">
      <ScreenHeader title="공금 사용 내역" />

      <section>
        {!snapshot && <LoadingCard />}

        {snapshot && expenses.length === 0 && (
          <p className="rounded-[1.25rem] bg-[#f7f8fa] p-5 text-[15px] font-semibold text-[#8a94a3]">
            아직 등록된 지출이 없어요.
          </p>
        )}

        {expenses.length > 0 && (
          <div className="divide-y divide-[#eef1f4]">
            {expenses.map((expense) => (
              <article className="flex items-center gap-3 py-4" key={expense.id}>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f2f6ff] text-[#2f6df6]">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-bold text-[#111827]">
                    {expense.name}
                  </h2>
                  <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                    {expense.dateLabel} · {expense.payerName} 결제 ·{" "}
                    {expense.exchangeName}
                  </p>
                </div>
                <p className="shrink-0 text-right text-[16px] font-bold text-[#111827]">
                  {formatWon(expense.realCost)}원
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <BackButton onClick={onBack} />
    </div>
  );
}

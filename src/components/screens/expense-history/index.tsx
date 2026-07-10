import { ArrowLeft, ReceiptText } from "lucide-react";
import { useMemo } from "react";
import {
  type ExpenseStatus,
  formatWon,
  getExpenseListItems
} from "@/features/home/spendingSummary";

type ExpenseHistoryScreenProps = {
  status: ExpenseStatus;
  onBack: () => void;
};

export function ExpenseHistoryScreen({ status, onBack }: ExpenseHistoryScreenProps) {
  const expenses = useMemo(() => {
    if (status.kind !== "ready") {
      return [];
    }

    return getExpenseListItems(status.snapshot);
  }, [status]);

  return (
    <div className="min-h-screen bg-white px-5 pb-10 pt-5">
      <header className="sticky top-0 z-10 -mx-5 bg-white/92 px-5 pb-4 pt-2 backdrop-blur-xl">
        <div className="grid h-11 grid-cols-[2.75rem_1fr_2.75rem] items-center">
          <button
            className="grid size-11 place-items-center rounded-full text-[#111827] hover:bg-[#f4f6f8]"
            type="button"
            aria-label="뒤로 가기"
            onClick={onBack}
          >
            <ArrowLeft className="size-6" aria-hidden="true" />
          </button>
          <h1 className="text-center text-[17px] font-bold text-[#111827]">
            공금 사용 내역
          </h1>
        </div>
      </header>

      <section className="pt-5">
        {status.kind === "missing-config" && (
          <p className="rounded-[1.25rem] bg-[#f7f8fa] p-5 text-[15px] font-semibold text-[#8a94a3]">
            Supabase 설정이 필요해요.
          </p>
        )}

        {status.kind === "loading" && (
          <p className="rounded-[1.25rem] bg-[#f7f8fa] p-5 text-[15px] font-semibold text-[#8a94a3]">
            지출을 불러오는 중이에요.
          </p>
        )}

        {status.kind === "error" && (
          <p className="rounded-[1.25rem] bg-[#f7f8fa] p-5 text-[15px] font-semibold text-[#8a94a3]">
            지출을 불러오지 못했어요.
          </p>
        )}

        {status.kind === "ready" && expenses.length === 0 && (
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
    </div>
  );
}

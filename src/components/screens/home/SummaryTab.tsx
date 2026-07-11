import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { LoadingCard } from "@/components/common/LoadingCard";
import {
  formatWon,
  getRealExpenseTotal,
  getWeeklyExpenseSummary
} from "@/features/home/spendingSummary";

type SummaryTabProps = {
  snapshot: BackendSnapshot | null;
  onOpenExpenseHistory: () => void;
};

export function SummaryTab({ snapshot, onOpenExpenseHistory }: SummaryTabProps) {
  const summary = useMemo(() => {
    if (!snapshot) {
      return {
        total: 0,
        weeks: []
      };
    }

    return {
      total: getRealExpenseTotal(snapshot),
      weeks: getWeeklyExpenseSummary(snapshot).reverse()
    };
  }, [snapshot]);

  return (
    <div className="min-h-screen px-7 pb-36 pt-32 sm:px-9 lg:px-12">
      <section>
        <h1
          className="bg-[linear-gradient(135deg,#374151_0%,#6478f3_30%,#38bdf8_55%,#45d39b_78%,#f6c453_100%)] bg-clip-text font-bold leading-[1.14] tracking-normal text-transparent"
          aria-label={`지금까지 ${formatWon(summary.total)}원을 썼어요`}
        >
          <span className="block text-[2.45rem]">지금까지</span>
          <span className="block text-[3.2rem] font-black">
            {formatWon(summary.total)}원
          </span>
          <span className="block text-[2.45rem]">썼어요</span>
        </h1>
      </section>

      <section className="relative mt-16 pl-9">
        <div className="absolute bottom-1 left-[0.8125rem] top-1 w-0.5 rounded-full bg-[#d9dee6]" />

        {!snapshot && <LoadingCard />}

        {summary.weeks.length > 0 && (
          <div className="grid gap-7">
            {summary.weeks.map((week) => (
              <article className="relative" key={week.id}>
                <span className="absolute -left-9 top-1 grid size-7 place-items-center rounded-full border-[5px] border-[#f2f4f6] bg-[#111827]" />
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#111827]">{week.label}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#9aa3af]">
                        {week.dateRange}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-[#111827]">
                      {formatWon(week.total)}원
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          className="mt-10 flex items-center gap-1 text-[15px] font-bold text-[#2f6df6] transition hover:text-[#1d4ed8]"
          type="button"
          onClick={onOpenExpenseHistory}
        >
          자세히 보기
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}

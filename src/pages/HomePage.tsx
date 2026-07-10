import { useMemo } from "react";
import {
  type ExpenseStatus,
  formatWon,
  getRealExpenseTotal,
  getWeeklyExpenseSummary
} from "../features/home/spendingSummary";

type HomePageProps = {
  status: ExpenseStatus;
};

export function HomePage({ status }: HomePageProps) {
  const summary = useMemo(() => {
    if (status.kind !== "ready") {
      return {
        total: 0,
        weeks: []
      };
    }

    return {
      total: getRealExpenseTotal(status.snapshot),
      weeks: getWeeklyExpenseSummary(status.snapshot).reverse()
    };
  }, [status]);

  return (
    <div className="min-h-screen px-5 pb-36 pt-32">
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

        {status.kind === "missing-config" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            Supabase 설정이 필요해요.
          </div>
        )}

        {status.kind === "loading" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            지출을 불러오는 중이에요.
          </div>
        )}

        {status.kind === "error" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            지출을 불러오지 못했어요.
          </div>
        )}

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
      </section>
    </div>
  );
}

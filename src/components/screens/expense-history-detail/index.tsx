import { ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { ExpenseDebtor, SettlementStatus } from "@/backend/schema";
import { BackButton } from "@/components/common/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingCard } from "@/components/common/LoadingCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import {
  formatDollar,
  formatWon,
  getExpenseAmountInWon
} from "@/features/home/spendingSummary";

type ExpenseHistoryDetailScreenProps = {
  snapshot: BackendSnapshot | null;
  expenseId: number | null;
  onBack: () => void;
  onDeleteExpense: (expenseId: number) => Promise<void>;
};

const settlementStatusLabel: Record<SettlementStatus, string> = {
  UNSETTLED: "정산 전",
  SETTLING: "송금 확인중",
  SETTLED: "정산 완료"
};

const settlementStatusClassName: Record<SettlementStatus, string> = {
  UNSETTLED: "bg-[#fff1f1] text-[#dc2626]",
  SETTLING: "bg-[#fff7ed] text-[#ea580c]",
  SETTLED: "bg-[#f2f6ff] text-[#2f6df6]"
};

export function ExpenseHistoryDetailScreen({
  snapshot,
  expenseId,
  onBack,
  onDeleteExpense
}: ExpenseHistoryDetailScreenProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const detail = useMemo(() => {
    if (!snapshot || expenseId === null) {
      return null;
    }

    const expense = snapshot.expenses.find((item) => item.id === expenseId);

    if (!expense) {
      return null;
    }

    const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
    const payer = peopleById.get(expense.payer);
    const debtors = snapshot.expenseDebtors
      .filter((debtor) => debtor.expense === expense.id)
      .map((debtor) => ({
        ...debtor,
        personName: peopleById.get(debtor.debtor)?.name ?? "알 수 없음"
      }))
      .sort((left, right) => left.personName.localeCompare(right.personName));

    return {
      expense,
      payerName: payer?.name ?? "알 수 없음",
      debtors
    };
  }, [expenseId, snapshot]);

  const deleteExpense = async () => {
    if (!detail || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteExpense(detail.expense.id);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      <ScreenHeader title="공금 사용 상세" />

      {!snapshot && <LoadingCard />}

      {snapshot && !detail && <EmptyState message="지출 내역을 찾을 수 없어요" />}

      {detail && (
        <div className="grid gap-5">
          <section className="grid gap-5 rounded-[1.75rem] bg-white p-5">
            <span className="grid size-12 place-items-center rounded-full bg-[#f2f6ff] text-[#2f6df6]">
              <ReceiptText className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-[26px] font-black leading-tight tracking-normal text-[#111827]">
                {detail.expense.name}
              </h1>
              <p className="mt-2 text-[14px] font-semibold text-[#8a94a3]">
                {formatKoreanDate(detail.expense.date)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DetailMetric
                label="가격 (달러)"
                value={`$${formatDollar(detail.expense.cost)}`}
              />
              <DetailMetric
                label="가격 (원화)"
                value={`${formatWon(getExpenseAmountInWon(detail.expense))}원`}
              />
              <DetailMetric
                label="환율 (원/달러)"
                value={String(detail.expense.exchange)}
              />
              <DetailMetric label="결제자" value={detail.payerName} />
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-5">
            <h2 className="text-[15px] font-black text-[#111827]">사용한 사람</h2>
            <div className="mt-3 divide-y divide-[#eef1f4]">
              {detail.debtors.map((debtor) => (
                <DebtorRow debtor={debtor} key={debtor.debtor} />
              ))}
            </div>
          </section>
        </div>
      )}

      {isConfirmOpen && (
        <DeleteConfirmDialog
          isDeleting={isDeleting}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={deleteExpense}
        />
      )}

      <BackButton
        onClick={onBack}
        action={{
          label: "지출 삭제",
          icon: Trash2,
          variant: "danger",
          disabled: !detail || isDeleting,
          onClick: () => setIsConfirmOpen(true)
        }}
      />
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-[#f7f8fa] p-4">
      <p className="text-[12px] font-bold text-[#8a94a3]">{label}</p>
      <p className="mt-1 truncate text-[16px] font-black text-[#111827]">{value}</p>
    </div>
  );
}

function DebtorRow({ debtor }: { debtor: ExpenseDebtor & { personName: string } }) {
  return (
    <article className="flex items-center justify-between gap-3 py-4">
      <p className="min-w-0 truncate text-[16px] font-bold text-[#111827]">
        {debtor.personName}
      </p>
      <span
        className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-black ${
          settlementStatusClassName[debtor.settlementStatus]
        }`}
      >
        {settlementStatusLabel[debtor.settlementStatus]}
      </span>
    </article>
  );
}

function DeleteConfirmDialog({
  isDeleting,
  onCancel,
  onConfirm
}: {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#111827]/40 px-7 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-[1.5rem] bg-white p-5 shadow-[0_24px_72px_rgba(15,23,42,0.24)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-expense-title"
        aria-describedby="delete-expense-description"
      >
        <h2
          className="text-[20px] font-black tracking-normal text-[#111827]"
          id="delete-expense-title"
        >
          지출을 삭제할까요?
        </h2>
        <p
          className="mt-2 text-[14px] font-semibold leading-6 text-[#6b7280]"
          id="delete-expense-description"
        >
          이 지출과 연결된 정산 상태가 함께 삭제돼요.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="h-12 rounded-[1rem] bg-[#f7f8fa] text-[15px] font-bold text-[#111827] transition hover:bg-[#eef1f4]"
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="h-12 rounded-[1rem] bg-[#dc2626] text-[15px] font-bold text-white transition hover:bg-[#b91c1c] disabled:bg-[#f0a7a7]"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "삭제 중" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatKoreanDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
}

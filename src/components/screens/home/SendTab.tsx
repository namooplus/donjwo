import { ReceiptText } from "lucide-react";
import { useMemo } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { LoadingCard } from "@/components/common/LoadingCard";
import { formatWon } from "@/features/home/spendingSummary";

type SendTabProps = {
  snapshot: BackendSnapshot | null;
};

type SendExpenseItem = {
  id: string;
  name: string;
  dateLabel: string;
  amount: number;
  hasPendingSender: boolean;
};

type SendCard = {
  payerId: number;
  payerName: string;
  total: number;
  expenses: SendExpenseItem[];
};

const targetPersonName = "민서";

export function SendTab({ snapshot }: SendTabProps) {
  const cards = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return getSendCards(snapshot);
  }, [snapshot]);

  return (
    <div className="grid gap-5 px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      {!snapshot && <LoadingCard />}

      {snapshot && cards.length === 0 && (
        <p className="rounded-[1.25rem] bg-white p-5 text-[15px] font-semibold text-[#8a94a3]">
          보낼 돈이 없어요.
        </p>
      )}

      {cards.map((card) => (
        <section className="rounded-[1.75rem] bg-white p-5" key={card.payerId}>
          <h2 className="whitespace-pre-line text-[24px] font-black leading-[1.18] tracking-normal text-[#111827]">
            {card.payerName}에게{"\n"}
            {formatWon(card.total)}원을 보내야 해요.
          </h2>

          <div className="mt-5 divide-y divide-[#eef1f4]">
            {card.expenses.map((expense) => (
              <article className="flex items-center gap-3 py-4" key={expense.id}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff1f1] text-[#dc2626]">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-bold text-[#111827]">
                    {expense.name}
                  </h3>
                  <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                    {expense.dateLabel} · {formatWon(expense.amount)}원
                  </p>
                </div>
                {expense.hasPendingSender && (
                  <button
                    className="shrink-0 rounded-full bg-[#111827] px-3.5 py-2 text-[13px] font-bold text-white"
                    type="button"
                  >
                    송금했어요
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function getSendCards(snapshot: BackendSnapshot): SendCard[] {
  const targetPerson = snapshot.people.find(
    (person) => person.name === targetPersonName
  );

  if (!targetPerson) {
    return [];
  }

  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );
  const debtorIdsByExpenseId = snapshot.expenseDebtors.reduce(
    (debtors, expenseDebtor) => {
      const expenseDebtors = debtors.get(expenseDebtor.expense) ?? new Set<number>();
      expenseDebtors.add(expenseDebtor.debtor);
      debtors.set(expenseDebtor.expense, expenseDebtors);

      return debtors;
    },
    new Map<number, Set<number>>()
  );
  const targetSendersByExpenseId = snapshot.expenseSenders.reduce(
    (senders, expenseSender) => {
      if (expenseSender.sender !== targetPerson.id) {
        return senders;
      }

      const expenseSenders = senders.get(expenseSender.expense) ?? [];
      expenseSenders.push(expenseSender);
      senders.set(expenseSender.expense, expenseSenders);

      return senders;
    },
    new Map<number, { verified: boolean }[]>()
  );
  const cardsByPayerId = new Map<number, SendCard>();

  for (const expense of snapshot.expenses) {
    if (expense.payer === targetPerson.id) {
      continue;
    }

    const debtorIds = debtorIdsByExpenseId.get(expense.id);

    if (!debtorIds?.has(targetPerson.id)) {
      continue;
    }

    const targetSenders = targetSendersByExpenseId.get(expense.id) ?? [];

    if (targetSenders.some((sender) => sender.verified)) {
      continue;
    }

    const payer = peopleById.get(expense.payer);

    if (!payer) {
      continue;
    }

    const exchange = exchangesById.get(expense.exchange);
    const amount = (expense.cost * (exchange?.value ?? 1)) / debtorIds.size;
    const card = cardsByPayerId.get(payer.id) ?? {
      payerId: payer.id,
      payerName: payer.name,
      total: 0,
      expenses: []
    };

    card.total += amount;
    card.expenses.push({
      id: String(expense.id),
      name: expense.name,
      dateLabel: formatKoreanDate(expense.date),
      amount,
      hasPendingSender: targetSenders.some((sender) => !sender.verified)
    });
    cardsByPayerId.set(payer.id, card);
  }

  return Array.from(cardsByPayerId.values())
    .map((card) => ({
      ...card,
      expenses: card.expenses.sort((left, right) => Number(right.id) - Number(left.id))
    }))
    .sort((left, right) => right.total - left.total);
}

function formatKoreanDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
}

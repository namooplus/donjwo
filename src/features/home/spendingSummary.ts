import type { BackendSnapshot } from "@/backend/queries";

export type ExpenseStatus =
  | { kind: "missing-config" }
  | { kind: "loading" }
  | { kind: "ready"; snapshot: BackendSnapshot }
  | { kind: "error"; message: string };

type WeeklyExpenseSummary = {
  id: string;
  label: string;
  dateRange: string;
  total: number;
};

type ExpenseListItem = {
  id: string;
  name: string;
  payerName: string;
  dateLabel: string;
  date: string;
  exchangeName: string;
  realCost: number;
};

const weekOneStart = new Date("2026-06-22T00:00:00");
const dayInMs = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getMondayStart(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function formatDateRange(startDate: Date) {
  const endDate = addDays(startDate, 6);

  return `${startDate.getMonth() + 1}.${startDate.getDate()} - ${
    endDate.getMonth() + 1
  }.${endDate.getDate()}`;
}

export function formatWon(amount: number) {
  return Math.round(amount).toLocaleString("ko-KR");
}

export function getRealExpenseTotal(snapshot: BackendSnapshot) {
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );

  return snapshot.expenses.reduce((total, expense) => {
    const exchange = exchangesById.get(expense.exchange);

    return total + expense.cost * (exchange?.value ?? 1);
  }, 0);
}

export function getWeeklyExpenseSummary(
  snapshot: BackendSnapshot
): WeeklyExpenseSummary[] {
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );
  const currentWeekStart = getMondayStart(new Date());
  const weekCount =
    Math.max(
      0,
      Math.floor((currentWeekStart.getTime() - weekOneStart.getTime()) / (dayInMs * 7))
    ) + 1;

  return Array.from({ length: weekCount }, (_, index) => {
    const startDate = addDays(weekOneStart, index * 7);
    const endDate = addDays(startDate, 7);
    const total = snapshot.expenses.reduce((weekTotal, expense) => {
      const expenseDate = new Date(`${expense.date}T00:00:00`);

      if (expenseDate < startDate || expenseDate >= endDate) {
        return weekTotal;
      }

      const exchange = exchangesById.get(expense.exchange);

      return weekTotal + expense.cost * (exchange?.value ?? 1);
    }, 0);

    return {
      id: `week-${index + 1}`,
      label: `${index + 1}주차`,
      dateRange: formatDateRange(startDate),
      total
    };
  });
}

export function getExpenseListItems(snapshot: BackendSnapshot): ExpenseListItem[] {
  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );

  return snapshot.expenses
    .map((expense) => {
      const payer = peopleById.get(expense.payer);
      const exchange = exchangesById.get(expense.exchange);

      return {
        id: String(expense.id),
        name: expense.name,
        payerName: payer?.name ?? "알 수 없음",
        dateLabel: formatKoreanDate(expense.date),
        date: expense.date,
        exchangeName: exchange?.name ?? "KRW",
        realCost: expense.cost * (exchange?.value ?? 1)
      };
    })
    .sort((left, right) => {
      const dateCompare = right.date.localeCompare(left.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return Number(right.id) - Number(left.id);
    });
}

function formatKoreanDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
}

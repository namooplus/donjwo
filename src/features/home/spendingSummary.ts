import type { BackendSnapshot } from "../../backend/queries";

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

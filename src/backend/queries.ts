import type { Exchange, Expense, ExpenseDebtor, ExpenseSender, Person } from "./schema";
import { getSupabaseClient } from "./supabase";

export interface BackendSnapshot {
  people: Person[];
  exchanges: Exchange[];
  expenses: Expense[];
  expenseDebtors: ExpenseDebtor[];
  expenseSenders: ExpenseSender[];
}

export async function getBackendSnapshot(): Promise<BackendSnapshot> {
  const supabase = getSupabaseClient();

  const [people, exchanges, expenses, expenseDebtors, expenseSenders] =
    await Promise.all([
      supabase.from("Person").select("*").order("name"),
      supabase.from("Exchange").select("*").order("name"),
      supabase.from("Expense").select("*").order("index"),
      supabase.from("ExpenseDebtor").select("*"),
      supabase.from("ExpenseSender").select("*")
    ]);

  if (people.error) {
    throw people.error;
  }

  if (exchanges.error) {
    throw exchanges.error;
  }

  if (expenses.error) {
    throw expenses.error;
  }

  if (expenseDebtors.error) {
    throw expenseDebtors.error;
  }

  if (expenseSenders.error) {
    throw expenseSenders.error;
  }

  return {
    people: people.data,
    exchanges: exchanges.data,
    expenses: expenses.data,
    expenseDebtors: expenseDebtors.data,
    expenseSenders: expenseSenders.data
  };
}

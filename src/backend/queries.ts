import type {
  Expense,
  ExpenseDebtor,
  ExpenseInsert,
  Person,
  SettlementStatus
} from "@/backend/schema";
import { getSupabaseClient } from "@/backend/supabase";

export interface BackendSnapshot {
  people: Person[];
  expenses: Expense[];
  expenseDebtors: ExpenseDebtor[];
}

export async function getBackendSnapshot(): Promise<BackendSnapshot> {
  const supabase = getSupabaseClient();

  const [people, expenses, expenseDebtors] = await Promise.all([
    supabase.from("Person").select("*").order("name"),
    supabase.from("Expense").select("*").order("index"),
    supabase.from("ExpenseDebtor").select("*")
  ]);

  if (people.error) {
    throw people.error;
  }

  if (expenses.error) {
    throw expenses.error;
  }

  if (expenseDebtors.error) {
    throw expenseDebtors.error;
  }

  return {
    people: people.data,
    expenses: expenses.data,
    expenseDebtors: expenseDebtors.data
  };
}

export type CreateExpenseInput = {
  name: string;
  date: ExpenseInsert["date"];
  payer: number;
  cost: number;
  exchange: number;
  debtorIds: number[];
  index: number;
};

export async function createExpenseWithDebtors(input: CreateExpenseInput) {
  const supabase = getSupabaseClient();
  const { data: expense, error: expenseError } = await supabase
    .from("Expense")
    .insert({
      name: input.name,
      date: input.date,
      payer: input.payer,
      cost: input.cost,
      exchange: input.exchange,
      index: input.index
    })
    .select("id")
    .single();

  if (expenseError) {
    throw expenseError;
  }

  if (input.debtorIds.length === 0) {
    return;
  }

  const { error: debtorError } = await supabase.from("ExpenseDebtor").insert(
    input.debtorIds.map((debtor) => ({
      expense: expense.id,
      debtor
    }))
  );

  if (debtorError) {
    throw debtorError;
  }
}

export async function updateExpenseDebtorSettlementStatus(
  expense: number,
  debtor: number,
  settlementStatus: SettlementStatus
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ExpenseDebtor")
    .update({ settlementStatus })
    .eq("expense", expense)
    .eq("debtor", debtor);

  if (error) {
    throw error;
  }
}

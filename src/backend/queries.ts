import type {
  Expense,
  ExpenseDebtor,
  ExpenseDebtorInsert,
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
  title: string;
  date: ExpenseInsert["date"];
  payer: number;
  exchange: number;
  index: number;
  expenseSets: {
    cost: number;
    description: string | null;
    debtorIds: number[];
  }[];
};

export async function createExpenseWithDebtors(input: CreateExpenseInput) {
  const supabase = getSupabaseClient();
  const { data: expenses, error: expenseError } = await supabase
    .from("Expense")
    .insert(
      input.expenseSets.map((expenseSet) => ({
        title: input.title,
        description: expenseSet.description,
        date: input.date,
        payer: input.payer,
        cost: expenseSet.cost,
        exchange: input.exchange,
        index: input.index
      }))
    )
    .select("id")
    .order("id");

  if (expenseError) {
    throw expenseError;
  }

  const expenseDebtors = expenses.flatMap((expense, index) =>
    input.expenseSets[index].debtorIds.map(
      (debtor): ExpenseDebtorInsert => ({
        expense: expense.id,
        debtor,
        settlementStatus: debtor === input.payer ? "SETTLED" : "UNSETTLED"
      })
    )
  );

  if (expenseDebtors.length === 0) {
    return;
  }

  const { error: debtorError } = await supabase
    .from("ExpenseDebtor")
    .insert(expenseDebtors);

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

export async function deleteExpenseWithDebtors(expenseId: number) {
  const supabase = getSupabaseClient();
  const { error: debtorError } = await supabase
    .from("ExpenseDebtor")
    .delete()
    .eq("expense", expenseId);

  if (debtorError) {
    throw debtorError;
  }

  const { error: expenseError } = await supabase
    .from("Expense")
    .delete()
    .eq("id", expenseId);

  if (expenseError) {
    throw expenseError;
  }
}

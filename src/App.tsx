import { useEffect, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import {
  type CreateExpenseInput,
  createExpenseWithDebtors,
  deleteExpenseWithDebtors,
  getBackendSnapshot,
  updateExpenseDebtorSettlementStatus
} from "@/backend/queries";
import { hasSupabaseConfig } from "@/backend/supabase";
import { ExpenseAddScreen } from "@/components/screens/expense-add";
import { ExpenseHistoryScreen } from "@/components/screens/expense-history";
import { ExpenseHistoryDetailScreen } from "@/components/screens/expense-history-detail";
import { HomeScreen } from "@/components/screens/home";

type ScreenKey = "root" | "expense-history" | "expense-history-detail" | "expense-add";

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("root");
  const [expenseSnapshot, setExpenseSnapshot] = useState<BackendSnapshot | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

  const refreshSnapshot = () => {
    if (!hasSupabaseConfig()) {
      return Promise.resolve();
    }

    return getBackendSnapshot()
      .then(setExpenseSnapshot)
      .catch(() => {});
  };

  useEffect(() => {
    let isCurrent = true;

    if (!hasSupabaseConfig()) {
      return;
    }

    getBackendSnapshot()
      .then((snapshot) => {
        if (isCurrent) {
          setExpenseSnapshot(snapshot);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, []);

  const markExpenseSent = async (expenseId: number, debtorId: number) => {
    await updateExpenseDebtorSettlementStatus(expenseId, debtorId, "SETTLING");
    await refreshSnapshot();
  };

  const markExpenseReceived = async (expenseId: number, debtorId: number) => {
    await updateExpenseDebtorSettlementStatus(expenseId, debtorId, "SETTLED");
    await refreshSnapshot();
  };

  const createExpense = async (input: CreateExpenseInput) => {
    await createExpenseWithDebtors(input);
    await refreshSnapshot();
    setActiveScreen("expense-history");
  };

  const openExpenseDetail = (expenseId: number) => {
    setSelectedExpenseId(expenseId);
    setActiveScreen("expense-history-detail");
  };

  const deleteExpense = async (expenseId: number) => {
    await deleteExpenseWithDebtors(expenseId);
    setSelectedExpenseId(null);
    await refreshSnapshot();
    setActiveScreen("expense-history");
  };

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="min-h-screen w-full overflow-hidden">
        {activeScreen === "root" && (
          <HomeScreen
            snapshot={expenseSnapshot}
            onOpenExpenseHistory={() => setActiveScreen("expense-history")}
            onSendExpense={markExpenseSent}
            onReceiveExpense={markExpenseReceived}
          />
        )}
        {activeScreen === "expense-history" && (
          <ExpenseHistoryScreen
            snapshot={expenseSnapshot}
            onBack={() => setActiveScreen("root")}
            onOpenExpenseAdd={() => setActiveScreen("expense-add")}
            onOpenExpenseDetail={openExpenseDetail}
          />
        )}
        {activeScreen === "expense-history-detail" && (
          <ExpenseHistoryDetailScreen
            snapshot={expenseSnapshot}
            expenseId={selectedExpenseId}
            onBack={() => setActiveScreen("expense-history")}
            onDeleteExpense={deleteExpense}
          />
        )}
        {activeScreen === "expense-add" && (
          <ExpenseAddScreen
            snapshot={expenseSnapshot}
            onBack={() => setActiveScreen("expense-history")}
            onCreateExpense={createExpense}
          />
        )}
      </div>
    </main>
  );
}

export default App;

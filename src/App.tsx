import { useEffect, useState } from "react";
import { getBackendSnapshot } from "@/backend/queries";
import { hasSupabaseConfig } from "@/backend/supabase";
import { ExpenseHistoryScreen } from "@/components/screens/expense-history";
import { HomeScreen } from "@/components/screens/home";
import type { ExpenseStatus } from "@/features/home/spendingSummary";

type ScreenKey = "root" | "expense-history";

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("root");
  const [expenseStatus, setExpenseStatus] = useState<ExpenseStatus>(() =>
    hasSupabaseConfig() ? { kind: "loading" } : { kind: "missing-config" }
  );

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      return;
    }

    let isCurrent = true;

    getBackendSnapshot()
      .then((snapshot) => {
        if (isCurrent) {
          setExpenseStatus({ kind: "ready", snapshot });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setExpenseStatus({
            kind: "error",
            message: error instanceof Error ? error.message : "Could not load expenses."
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden">
        {activeScreen === "root" && (
          <HomeScreen
            status={expenseStatus}
            onOpenExpenseHistory={() => setActiveScreen("expense-history")}
          />
        )}
        {activeScreen === "expense-history" && (
          <ExpenseHistoryScreen
            status={expenseStatus}
            onBack={() => setActiveScreen("root")}
          />
        )}
      </div>
    </main>
  );
}

export default App;

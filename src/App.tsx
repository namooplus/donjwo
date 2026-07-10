import { useEffect, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { getBackendSnapshot } from "@/backend/queries";
import { hasSupabaseConfig } from "@/backend/supabase";
import { ExpenseHistoryScreen } from "@/components/screens/expense-history";
import { HomeScreen } from "@/components/screens/home";

type ScreenKey = "root" | "expense-history";

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("root");
  const [expenseSnapshot, setExpenseSnapshot] = useState<BackendSnapshot | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      return;
    }

    let isCurrent = true;

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

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="min-h-screen w-full overflow-hidden">
        {activeScreen === "root" && (
          <HomeScreen
            snapshot={expenseSnapshot}
            onOpenExpenseHistory={() => setActiveScreen("expense-history")}
          />
        )}
        {activeScreen === "expense-history" && (
          <ExpenseHistoryScreen
            snapshot={expenseSnapshot}
            onBack={() => setActiveScreen("root")}
          />
        )}
      </div>
    </main>
  );
}

export default App;

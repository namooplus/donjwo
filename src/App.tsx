import { useEffect, useState } from "react";
import { getBackendSnapshot } from "./backend/queries";
import { hasSupabaseConfig } from "./backend/supabase";
import { AppHeader } from "./components/AppHeader";
import { FloatingTabs } from "./components/FloatingTabs";
import type { ExpenseStatus } from "./features/home/spendingSummary";
import type { TabKey } from "./navigation/tabs";
import { HomePage } from "./pages/HomePage";
import { ReceivePage } from "./pages/ReceivePage";
import { SendPage } from "./pages/SendPage";

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
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
        <AppHeader />

        {activeTab === "home" && <HomePage status={expenseStatus} />}
        {activeTab === "send" && <SendPage />}
        {activeTab === "receive" && <ReceivePage />}
      </div>

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}

export default App;

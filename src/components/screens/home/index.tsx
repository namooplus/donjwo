import { useState } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { FloatingTabs, type HomeTabKey } from "@/components/common/FloatingTabs";
import { ReceiveTab } from "@/components/screens/home/ReceiveTab";
import { SendTab } from "@/components/screens/home/SendTab";
import { SummaryTab } from "@/components/screens/home/SummaryTab";
import type { ExpenseStatus } from "@/features/home/spendingSummary";

type HomeScreenProps = {
  status: ExpenseStatus;
  onOpenExpenseHistory: () => void;
};

export function HomeScreen({ status, onOpenExpenseHistory }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<HomeTabKey>("summary");

  return (
    <>
      <AppHeader />

      {activeTab === "summary" && (
        <SummaryTab status={status} onOpenExpenseHistory={onOpenExpenseHistory} />
      )}
      {activeTab === "send" && <SendTab />}
      {activeTab === "receive" && <ReceiveTab />}

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

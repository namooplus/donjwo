import { useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import { FloatingTabs, type HomeTabKey } from "@/components/common/FloatingTabs";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ReceiveTab } from "@/components/screens/home/ReceiveTab";
import { SendTab } from "@/components/screens/home/SendTab";
import { SummaryTab } from "@/components/screens/home/SummaryTab";

type HomeScreenProps = {
  snapshot: BackendSnapshot | null;
  onOpenExpenseHistory: () => void;
};

export function HomeScreen({ snapshot, onOpenExpenseHistory }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<HomeTabKey>("summary");

  return (
    <>
      <ScreenHeader title="공금" />

      {activeTab === "summary" && (
        <SummaryTab snapshot={snapshot} onOpenExpenseHistory={onOpenExpenseHistory} />
      )}
      {activeTab === "send" && <SendTab />}
      {activeTab === "receive" && <ReceiveTab />}

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

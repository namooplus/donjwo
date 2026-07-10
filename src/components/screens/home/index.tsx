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
  const titleByTab: Record<HomeTabKey, string> = {
    summary: "공금",
    send: "민서가 보내야 할 돈",
    receive: "민서가 받아야 할 돈"
  };

  return (
    <>
      <ScreenHeader title={titleByTab[activeTab]} />

      {activeTab === "summary" && (
        <SummaryTab snapshot={snapshot} onOpenExpenseHistory={onOpenExpenseHistory} />
      )}
      {activeTab === "send" && <SendTab snapshot={snapshot} />}
      {activeTab === "receive" && <ReceiveTab snapshot={snapshot} />}

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

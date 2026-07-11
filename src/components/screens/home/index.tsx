import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { Person } from "@/backend/schema";
import { FloatingPicker } from "@/components/common/FloatingPicker";
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
  const [selectedSenderId, setSelectedSenderId] = useState<number | null>(null);
  const selectedSender = useMemo(() => {
    if (!snapshot || selectedSenderId === null) {
      return null;
    }

    return snapshot.people.find((person) => person.id === selectedSenderId) ?? null;
  }, [selectedSenderId, snapshot]);
  const titleByTab: Record<HomeTabKey, string> = {
    summary: "공금",
    send: "보내야 할 돈",
    receive: "민서가 받아야 할 돈"
  };

  useEffect(() => {
    if (!snapshot || snapshot.people.length === 0) {
      return;
    }

    if (snapshot.people.some((person) => person.id === selectedSenderId)) {
      return;
    }

    const defaultSender =
      snapshot.people.find((person) => person.name === "민서") ?? snapshot.people[0];

    setSelectedSenderId(defaultSender.id);
  }, [selectedSenderId, snapshot]);

  const headerTitle =
    activeTab === "send" ? (
      <SendHeaderTitle
        people={snapshot?.people ?? []}
        selectedSenderId={selectedSenderId}
        onChange={setSelectedSenderId}
      />
    ) : (
      titleByTab[activeTab]
    );

  return (
    <>
      <ScreenHeader title={headerTitle} />

      {activeTab === "summary" && (
        <SummaryTab snapshot={snapshot} onOpenExpenseHistory={onOpenExpenseHistory} />
      )}
      {activeTab === "send" && (
        <SendTab snapshot={snapshot} targetSender={selectedSender} />
      )}
      {activeTab === "receive" && <ReceiveTab snapshot={snapshot} />}

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

type SendHeaderTitleProps = {
  people: Person[];
  selectedSenderId: number | null;
  onChange: (personId: number) => void;
};

function SendHeaderTitle({ people, selectedSenderId, onChange }: SendHeaderTitleProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedPerson = people.find((person) => person.id === selectedSenderId);
  const options = people.map((person) => ({
    value: person.id,
    label: person.name
  }));

  const selectPerson = (personId: number) => {
    onChange(personId);
    setIsPickerOpen(false);
  };

  return (
    <span className="block leading-[1.14]">
      <span className="flex min-w-0 items-center gap-1">
        <span className="relative min-w-0">
          <button
            className="flex min-w-0 max-w-[10rem] items-center gap-1 rounded-xl text-left text-4xl font-bold tracking-normal text-[#111827] outline-none disabled:text-[#9aa3af]"
            type="button"
            aria-label="보낼 사람 선택"
            aria-haspopup="listbox"
            aria-expanded={isPickerOpen}
            disabled={people.length === 0}
            onClick={() => setIsPickerOpen(true)}
          >
            <span className="truncate">{selectedPerson?.name ?? "선택"}</span>
            <ChevronDown
              className="size-6 shrink-0 text-[#111827]"
              aria-hidden="true"
            />
          </button>
          <FloatingPicker
            ariaLabel="보낼 사람 선택"
            options={options}
            selectedValue={selectedSenderId}
            isOpen={isPickerOpen}
            onChange={selectPerson}
            onClose={() => setIsPickerOpen(false)}
          />
        </span>
        <span className="shrink-0">가</span>
      </span>
      <span className="block">보내야 할 돈</span>
    </span>
  );
}

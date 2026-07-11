import { ArrowDownLeft, ChevronDown, Home, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { Person } from "@/backend/schema";
import { FloatingPicker } from "@/components/common/FloatingPicker";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { ReceiveFragment } from "@/components/screens/home/fragments/ReceiveFragment";
import { SendFragment } from "@/components/screens/home/fragments/SendFragment";
import { SummaryFragment } from "@/components/screens/home/fragments/SummaryFragment";

type HomeTabKey = "summary" | "send" | "receive";

type Tab = {
  key: HomeTabKey;
  label: string;
  icon: typeof Home;
};

const tabs: Tab[] = [
  { key: "summary", label: "Summary", icon: Home },
  { key: "send", label: "Send", icon: Send },
  { key: "receive", label: "Receive", icon: ArrowDownLeft }
];

type HomeScreenProps = {
  snapshot: BackendSnapshot | null;
  onOpenExpenseHistory: () => void;
  onSendExpense: (expenseId: number, debtorId: number) => void;
  onReceiveExpense: (expenseId: number, debtorId: number) => void;
};

export function HomeScreen({
  snapshot,
  onOpenExpenseHistory,
  onSendExpense,
  onReceiveExpense
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<HomeTabKey>("summary");
  const [selectedSenderId, setSelectedSenderId] = useState<number | null>(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
  const selectedSender = useMemo(() => {
    if (!snapshot || selectedSenderId === null) {
      return null;
    }

    return snapshot.people.find((person) => person.id === selectedSenderId) ?? null;
  }, [selectedSenderId, snapshot]);
  const selectedReceiver = useMemo(() => {
    if (!snapshot || selectedReceiverId === null) {
      return null;
    }

    return snapshot.people.find((person) => person.id === selectedReceiverId) ?? null;
  }, [selectedReceiverId, snapshot]);
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

  useEffect(() => {
    if (!snapshot || snapshot.people.length === 0) {
      return;
    }

    if (snapshot.people.some((person) => person.id === selectedReceiverId)) {
      return;
    }

    const defaultReceiver =
      snapshot.people.find((person) => person.name === "민서") ?? snapshot.people[0];

    setSelectedReceiverId(defaultReceiver.id);
  }, [selectedReceiverId, snapshot]);

  const headerTitle =
    activeTab === "send" ? (
      <PersonHeaderTitle
        people={snapshot?.people ?? []}
        selectedPersonId={selectedSenderId}
        pickerLabel="보낼 사람 선택"
        suffix="보내야 할 돈"
        onChange={setSelectedSenderId}
      />
    ) : activeTab === "receive" ? (
      <PersonHeaderTitle
        people={snapshot?.people ?? []}
        selectedPersonId={selectedReceiverId}
        pickerLabel="받을 사람 선택"
        suffix="받아야 할 돈"
        onChange={setSelectedReceiverId}
      />
    ) : (
      "돈줘"
    );

  return (
    <>
      <ScreenHeader title={headerTitle} />

      {activeTab === "summary" && (
        <SummaryFragment
          snapshot={snapshot}
          onOpenExpenseHistory={onOpenExpenseHistory}
        />
      )}
      {activeTab === "send" && (
        <SendFragment
          snapshot={snapshot}
          targetSender={selectedSender}
          onSendExpense={onSendExpense}
        />
      )}
      {activeTab === "receive" && (
        <ReceiveFragment
          snapshot={snapshot}
          targetReceiver={selectedReceiver}
          onReceiveExpense={onReceiveExpense}
        />
      )}

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </>
  );
}

type FloatingTabsProps = {
  activeTab: HomeTabKey;
  onChange: (tab: HomeTabKey) => void;
};

function FloatingTabs({ activeTab, onChange }: FloatingTabsProps) {
  return (
    <nav
      className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/88 p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            className={[
              "flex h-12 min-w-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition",
              isActive ? "floating-tab-active" : "floating-tab-inactive"
            ].join(" ")}
            key={tab.key}
            type="button"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab.key)}
          >
            <Icon className="size-5" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

type PersonHeaderTitleProps = {
  people: Person[];
  selectedPersonId: number | null;
  pickerLabel: string;
  suffix: string;
  onChange: (personId: number) => void;
};

function PersonHeaderTitle({
  people,
  selectedPersonId,
  pickerLabel,
  suffix,
  onChange
}: PersonHeaderTitleProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedPerson = people.find((person) => person.id === selectedPersonId);
  const options = people.map((person) => ({
    value: person.id,
    label: person.name
  }));

  const selectPerson = (personId: number) => {
    onChange(personId);
    setIsPickerOpen(false);
  };

  return (
    <span className="block leading-tight">
      <span className="flex min-w-0 items-center gap-1">
        <span className="relative min-w-0">
          <button
            className="flex min-w-0 max-w-[8.5rem] items-center gap-1 rounded-xl text-left text-[28px] font-bold tracking-normal text-[#111827] outline-none disabled:text-[#9aa3af]"
            type="button"
            aria-label={pickerLabel}
            aria-haspopup="listbox"
            aria-expanded={isPickerOpen}
            disabled={people.length === 0}
            onClick={() => setIsPickerOpen(true)}
          >
            <span className="truncate">{selectedPerson?.name ?? "선택"}</span>
            <ChevronDown
              className="size-5 shrink-0 text-[#111827]"
              aria-hidden="true"
            />
          </button>
          <FloatingPicker
            ariaLabel={pickerLabel}
            options={options}
            selectedValue={selectedPersonId}
            isOpen={isPickerOpen}
            onChange={selectPerson}
            onClose={() => setIsPickerOpen(false)}
          />
        </span>
        <span className="shrink-0">가</span>
      </span>
      <span className="block">{suffix}</span>
    </span>
  );
}

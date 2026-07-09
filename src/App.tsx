import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Home,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { useState } from "react";

type TabKey = "home" | "send" | "receive";

type Tab = {
  key: TabKey;
  label: string;
  icon: typeof Home;
};

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "send", label: "Send", icon: Send },
  { key: "receive", label: "Receive", icon: ArrowDownLeft }
];

const contacts = [
  { name: "Mina", label: "Recent", color: "bg-[#eaf2ff] text-[#2b6eea]" },
  { name: "Joon", label: "Friend", color: "bg-[#ecf9f2] text-[#14804a]" },
  { name: "Hana", label: "Saved", color: "bg-[#fff1dc] text-[#c46b00]" }
];

const activity = [
  {
    title: "Dinner split",
    detail: "Today, 8:42 PM",
    amount: "-$28.40",
    icon: ReceiptText,
    tone: "bg-[#eef3ff] text-[#3c6df0]"
  },
  {
    title: "Received from Mina",
    detail: "Yesterday",
    amount: "+$64.00",
    icon: ArrowDownLeft,
    tone: "bg-[#eaf8f0] text-[#178049]"
  },
  {
    title: "Travel wallet",
    detail: "Jun 28",
    amount: "-$132.18",
    icon: WalletCards,
    tone: "bg-[#fff3df] text-[#c66b00]"
  }
];

const qrCells = Array.from({ length: 25 }, (_, index) => ({
  id: `qr-cell-${index + 1}`,
  filled: [0, 1, 2, 5, 7, 10, 11, 12, 18, 20, 22, 23, 24].includes(index)
}));

function AppHeader() {
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      <button
        className="grid size-11 place-items-center rounded-full bg-white text-[#1f2937] shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        type="button"
        aria-label="Search"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <span className="grid size-7 place-items-center rounded-full bg-[#111827]">
          <Sparkles className="size-4 text-white" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-[#111827]">Yugain</span>
      </div>

      <button
        className="grid size-11 place-items-center rounded-full bg-white text-[#1f2937] shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        type="button"
        aria-label="Notifications"
      >
        <Bell className="size-5" aria-hidden="true" />
      </button>
    </header>
  );
}

function FloatingTabs({
  activeTab,
  onChange
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
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

function HomePage() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-8">
      <section className="rounded-[2rem] bg-[#111827] p-6 text-white shadow-[0_24px_70px_rgba(17,24,39,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/62">Available balance</p>
            <h1 className="mt-3 text-5xl font-bold tracking-normal">$2,480.50</h1>
          </div>
          <span className="rounded-full bg-white/12 px-3 py-1.5 text-sm font-semibold text-white/82">
            USD
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold text-[#111827]"
            type="button"
          >
            <ArrowUpRight className="size-5" aria-hidden="true" />
            Send
          </button>
          <button
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/12 text-[15px] font-semibold text-white"
            type="button"
          >
            <ArrowDownLeft className="size-5" aria-hidden="true" />
            Receive
          </button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Cards", value: "4", icon: WalletCards },
          { label: "Paid", value: "$780", icon: Check },
          { label: "Pending", value: "2", icon: Clock3 }
        ].map((item) => (
          <article className="rounded-3xl bg-white p-4" key={item.label}>
            <span className="grid size-10 place-items-center rounded-2xl bg-[#f2f4f7] text-[#111827]">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-bold text-[#111827]">{item.value}</p>
            <p className="mt-1 text-sm font-medium text-[#6b7280]">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] bg-white p-2">
        <div className="flex items-center justify-between px-3 py-3">
          <h2 className="text-lg font-bold text-[#111827]">Activity</h2>
          <button
            className="grid size-9 place-items-center rounded-full bg-[#f4f6f8] text-[#111827]"
            type="button"
            aria-label="View all activity"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-1">
          {activity.map((item) => (
            <article
              className="flex items-center gap-3 rounded-3xl px-3 py-3"
              key={item.title}
            >
              <span
                className={`grid size-12 place-items-center rounded-2xl ${item.tone}`}
              >
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#111827]">{item.title}</p>
                <p className="mt-0.5 text-sm font-medium text-[#8a94a3]">
                  {item.detail}
                </p>
              </div>
              <p className="font-bold text-[#111827]">{item.amount}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SendPage() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-8">
      <section className="rounded-[2rem] bg-white p-5">
        <p className="text-sm font-semibold text-[#8a94a3]">Send money</p>
        <div className="mt-6 flex items-end gap-2">
          <span className="pb-2 text-3xl font-bold text-[#8a94a3]">$</span>
          <h1 className="text-6xl font-bold tracking-normal text-[#111827]">125</h1>
          <span className="pb-3 text-xl font-bold text-[#8a94a3]">.00</span>
        </div>
        <div className="mt-6 rounded-3xl bg-[#f4f6f8] px-4 py-4">
          <p className="text-sm font-medium text-[#8a94a3]">To</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#eaf2ff] text-sm font-bold text-[#2b6eea]">
                MN
              </span>
              <div>
                <p className="font-bold text-[#111827]">Mina Kim</p>
                <p className="text-sm font-medium text-[#8a94a3]">m.kim@yugain</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-[#8a94a3]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white p-2">
        <div className="flex items-center justify-between px-3 py-3">
          <h2 className="text-lg font-bold text-[#111827]">People</h2>
          <button
            className="grid size-9 place-items-center rounded-full bg-[#111827] text-white"
            type="button"
            aria-label="Add recipient"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-1">
          {contacts.map((contact) => (
            <button
              className="flex items-center gap-3 rounded-3xl px-3 py-3 text-left hover:bg-[#f7f8fa]"
              key={contact.name}
              type="button"
            >
              <span
                className={`grid size-12 place-items-center rounded-full text-sm font-bold ${contact.color}`}
              >
                {contact.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111827]">{contact.name}</p>
                <p className="text-sm font-medium text-[#8a94a3]">{contact.label}</p>
              </div>
              <Send className="size-5 text-[#8a94a3]" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <button
        className="flex h-16 items-center justify-center gap-2 rounded-[1.5rem] bg-[#2f6df6] text-[17px] font-bold text-white shadow-[0_16px_32px_rgba(47,109,246,0.24)]"
        type="button"
      >
        <ShieldCheck className="size-5" aria-hidden="true" />
        Confirm transfer
      </button>
    </div>
  );
}

function ReceivePage() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-8">
      <section className="rounded-[2rem] bg-white p-5 text-center">
        <p className="text-sm font-semibold text-[#8a94a3]">Receive money</p>
        <h1 className="mt-2 text-3xl font-bold text-[#111827]">Share your code</h1>

        <div className="mx-auto mt-7 grid size-64 max-w-full place-items-center rounded-[2rem] bg-[#f4f6f8] p-5">
          <div className="grid size-full grid-cols-5 gap-2 rounded-3xl bg-white p-4">
            {qrCells.map((cell) => (
              <span
                className={[
                  "rounded-md",
                  cell.filled ? "bg-[#111827]" : "bg-[#dfe5ec]"
                ].join(" ")}
                key={cell.id}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-[#f4f6f8] px-4 py-4 text-left">
          <p className="text-sm font-medium text-[#8a94a3]">Account</p>
          <p className="mt-1 font-bold text-[#111827]">Yugain Wallet 0429</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          className="flex h-28 flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-white text-[#111827]"
          type="button"
        >
          <QrCode className="size-6" aria-hidden="true" />
          <span className="font-semibold">Show QR</span>
        </button>
        <button
          className="flex h-28 flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-white text-[#111827]"
          type="button"
        >
          <ReceiptText className="size-6" aria-hidden="true" />
          <span className="font-semibold">Request</span>
        </button>
      </section>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <main className="min-h-screen bg-[#f2f4f6] text-[#111827]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden">
        <AppHeader />

        {activeTab === "home" && <HomePage />}
        {activeTab === "send" && <SendPage />}
        {activeTab === "receive" && <ReceivePage />}
      </div>

      <FloatingTabs activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}

export default App;

import {
  ArrowDownLeft,
  ChevronRight,
  Home,
  Plus,
  QrCode,
  ReceiptText,
  Send,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type BackendSnapshot, getBackendSnapshot } from "./backend/queries";
import { hasSupabaseConfig } from "./backend/supabase";

type TabKey = "home" | "send" | "receive";

type ExpenseStatus =
  | { kind: "missing-config" }
  | { kind: "loading" }
  | { kind: "ready"; snapshot: BackendSnapshot }
  | { kind: "error"; message: string };

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

const qrCells = Array.from({ length: 25 }, (_, index) => ({
  id: `qr-cell-${index + 1}`,
  filled: [0, 1, 2, 5, 7, 10, 11, 12, 18, 20, 22, 23, 24].includes(index)
}));

const weekOneStart = new Date("2026-06-22T00:00:00");
const dayInMs = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getMondayStart(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function formatDateRange(startDate: Date) {
  const endDate = addDays(startDate, 6);

  return `${startDate.getMonth() + 1}.${startDate.getDate()} - ${
    endDate.getMonth() + 1
  }.${endDate.getDate()}`;
}

function formatWon(amount: number) {
  return Math.round(amount).toLocaleString("ko-KR");
}

function getRealExpenseTotal(snapshot: BackendSnapshot) {
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );

  return snapshot.expenses.reduce((total, expense) => {
    const exchange = exchangesById.get(expense.exchange);

    return total + expense.cost * (exchange?.value ?? 1);
  }, 0);
}

function getWeeklyExpenseSummary(snapshot: BackendSnapshot) {
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );
  const currentWeekStart = getMondayStart(new Date());
  const weekCount =
    Math.max(
      0,
      Math.floor((currentWeekStart.getTime() - weekOneStart.getTime()) / (dayInMs * 7))
    ) + 1;

  return Array.from({ length: weekCount }, (_, index) => {
    const startDate = addDays(weekOneStart, index * 7);
    const endDate = addDays(startDate, 7);
    const total = snapshot.expenses.reduce((weekTotal, expense) => {
      const expenseDate = new Date(`${expense.date}T00:00:00`);

      if (expenseDate < startDate || expenseDate >= endDate) {
        return weekTotal;
      }

      const exchange = exchangesById.get(expense.exchange);

      return weekTotal + expense.cost * (exchange?.value ?? 1);
    }, 0);

    return {
      id: `week-${index + 1}`,
      label: `${index + 1}주차`,
      dateRange: formatDateRange(startDate),
      total
    };
  });
}

function AppHeader() {
  return (
    <header className="fixed left-1/2 top-0 z-10 w-full max-w-[430px] -translate-x-1/2 bg-[#f2f4f6] px-5 pb-8 pt-5">
      <h1 className="bg-gradient-to-b from-[#111827] from-55% to-[#111827]/0 bg-clip-text text-4xl font-bold tracking-normal text-transparent">
        공금
      </h1>
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

function HomePage({ status }: { status: ExpenseStatus }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const summary = useMemo(() => {
    if (status.kind !== "ready") {
      return {
        total: 0,
        weeks: []
      };
    }

    return {
      total: getRealExpenseTotal(status.snapshot),
      weeks: getWeeklyExpenseSummary(status.snapshot)
    };
  }, [status]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, []);

  useEffect(() => {
    if (status.kind === "ready") {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [status.kind]);

  return (
    <div className="min-h-screen px-5 pb-36 pt-32">
      <section className="relative pl-9">
        <div className="absolute bottom-1 left-[0.8125rem] top-1 w-0.5 rounded-full bg-[#d9dee6]" />

        {status.kind === "missing-config" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            Supabase 설정이 필요해요.
          </div>
        )}

        {status.kind === "loading" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            지출을 불러오는 중이에요.
          </div>
        )}

        {status.kind === "error" && (
          <div className="rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
            지출을 불러오지 못했어요.
          </div>
        )}

        {summary.weeks.length > 0 && (
          <div className="grid gap-7">
            {summary.weeks.map((week) => (
              <article className="relative" key={week.id}>
                <span className="absolute -left-9 top-1 grid size-7 place-items-center rounded-full border-[5px] border-[#f2f4f6] bg-[#111827]" />
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#111827]">{week.label}</h2>
                      <p className="mt-1 text-sm font-semibold text-[#9aa3af]">
                        {week.dateRange}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-[#111827]">
                      {formatWon(week.total)}원
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="pt-24">
        <h1 className="whitespace-pre-line text-[3.6rem] font-bold leading-[1.08] tracking-normal text-[#111827]">
          {`지금까지\n${formatWon(summary.total)}원을\n썼어요`}
        </h1>
      </section>
      <div ref={bottomRef} />
    </div>
  );
}

function SendPage() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-32">
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
    <div className="grid gap-5 px-5 pb-32 pt-32">
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

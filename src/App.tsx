import {
  AlertTriangle,
  ArrowDownUp,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Database,
  FileDown,
  LayoutDashboard,
  Loader2,
  Menu,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldAlert,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type BackendSnapshot, getBackendSnapshot } from "./backend/queries";
import { hasSupabaseConfig } from "./backend/supabase";

type BackendStatus =
  | { kind: "missing-config" }
  | { kind: "loading" }
  | { kind: "ready"; snapshot: BackendSnapshot }
  | { kind: "error"; message: string };

type ExpenseRow = ReturnType<typeof getExpenseRows>[number];

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Expenses", icon: ReceiptText, active: false },
  { label: "People", icon: UsersRound, active: false },
  { label: "Exchange", icon: ArrowDownUp, active: false },
  { label: "Settings", icon: Settings, active: false }
];

function formatCost(cost: number, exchangeName: string) {
  const formattedCost = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(cost);

  return `${formattedCost} ${exchangeName}`.trim();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

function getExpenseRows(snapshot: BackendSnapshot) {
  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  const exchangesById = new Map(
    snapshot.exchanges.map((exchange) => [exchange.id, exchange])
  );

  return snapshot.expenses.map((expense) => {
    const exchange = exchangesById.get(expense.exchange);
    const debtors = snapshot.expenseDebtors
      .filter((debtor) => debtor.expense === expense.id)
      .map(
        (debtor) => peopleById.get(debtor.debtor)?.name ?? `Person #${debtor.debtor}`
      );
    const senders = snapshot.expenseSenders
      .filter((sender) => sender.expense === expense.id)
      .map((sender) => ({
        name: peopleById.get(sender.sender)?.name ?? `Person #${sender.sender}`,
        verified: sender.verified
      }));

    return {
      ...expense,
      costLabel: formatCost(expense.cost, exchange?.name ?? ""),
      dateLabel: formatDate(expense.date),
      debtors,
      exchangeName: exchange?.name ?? "Unknown",
      payerName: peopleById.get(expense.payer)?.name ?? `Person #${expense.payer}`,
      senders,
      verifiedSenderCount: senders.filter((sender) => sender.verified).length
    };
  });
}

function getSnapshotCounts(status: BackendStatus) {
  if (status.kind !== "ready") {
    return {
      exchanges: "-",
      expenses: "-",
      people: "-",
      verified: "-"
    };
  }

  return {
    exchanges: status.snapshot.exchanges.length.toString(),
    expenses: status.snapshot.expenses.length.toString(),
    people: status.snapshot.people.length.toString(),
    verified: status.snapshot.expenseSenders
      .filter((sender) => sender.verified)
      .length.toString()
  };
}

function StatusBadge({ status }: { status: BackendStatus }) {
  if (status.kind === "ready") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        Live
      </span>
    );
  }

  if (status.kind === "loading") {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
      <ShieldAlert className="size-4" aria-hidden="true" />
      Action needed
    </span>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <img src="/icon.svg" alt="" className="size-9 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">Yugain</p>
          <p className="truncate text-xs font-bold text-slate-500">Settlement desk</p>
        </div>
      </div>

      <nav className="grid gap-1 p-3" aria-label="Primary">
        {navigationItems.map((item) => (
          <button
            className={[
              "flex h-10 items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition",
              item.active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            ].join(" ")}
            key={item.label}
            type="button"
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function SummaryStrip({ counts }: { counts: ReturnType<typeof getSnapshotCounts> }) {
  const items = [
    {
      label: "Visible expenses",
      value: counts.expenses,
      icon: ReceiptText,
      tone: "border-cyan-600"
    },
    {
      label: "People",
      value: counts.people,
      icon: UsersRound,
      tone: "border-violet-600"
    },
    {
      label: "Verified senders",
      value: counts.verified,
      icon: CheckCircle2,
      tone: "border-emerald-600"
    },
    {
      label: "Exchange tables",
      value: counts.exchanges,
      icon: CircleDollarSign,
      tone: "border-amber-600"
    }
  ];

  return (
    <section
      aria-label="Settlement summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((item) => (
        <article
          className={`rounded-lg border border-l-4 ${item.tone} bg-white p-4`}
          key={item.label}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black leading-none text-slate-950">
                {item.value}
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

function BackendNotice({ status }: { status: BackendStatus }) {
  if (status.kind === "ready") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
        <Database className="size-5 shrink-0" aria-hidden="true" />
        Supabase data loaded.
      </div>
    );
  }

  if (status.kind === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
        <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
        Loading Supabase tables.
      </div>
    );
  }

  if (status.kind === "missing-config") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
        <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
        Missing Supabase environment values.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
      <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
      {status.message}
    </div>
  );
}

function ExpenseState({ status }: { status: BackendStatus }) {
  if (status.kind === "missing-config") {
    return (
      <div className="px-5 py-12 text-center">
        <p className="font-bold text-slate-950">Supabase is not configured.</p>
        <p className="mt-2 text-sm text-slate-500">
          Add Vite Supabase values to show expenses.
        </p>
      </div>
    );
  }

  if (status.kind === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 px-5 py-12 text-sm font-bold text-slate-500">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Loading expenses
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="px-5 py-12 text-center">
        <p className="font-bold text-rose-700">Expense list unavailable.</p>
        <p className="mt-2 text-sm text-slate-500">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-12 text-center">
      <p className="font-bold text-slate-950">No visible expenses.</p>
      <p className="mt-2 text-sm text-slate-500">
        Check row policies if expenses exist in Supabase.
      </p>
    </div>
  );
}

function ExpenseTable({ rows, status }: { rows: ExpenseRow[]; status: BackendStatus }) {
  if (rows.length === 0) {
    return <ExpenseState status={status} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {["#", "Expense", "Date", "Payer", "Cost", "Debtors", "Senders"].map(
              (heading) => (
                <th
                  className="px-5 py-3 text-xs font-black uppercase text-slate-500"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((expense) => (
            <tr className="bg-white hover:bg-slate-50" key={expense.id}>
              <td className="px-5 py-4 text-sm font-black text-slate-500">
                {expense.index}
              </td>
              <td className="px-5 py-4">
                <p className="font-black text-slate-950">{expense.name}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {expense.exchangeName}
                </p>
              </td>
              <td className="px-5 py-4 text-sm font-bold text-slate-600">
                {expense.dateLabel}
              </td>
              <td className="px-5 py-4 text-sm font-bold text-slate-700">
                {expense.payerName}
              </td>
              <td className="px-5 py-4 text-sm font-black text-slate-950">
                {expense.costLabel}
              </td>
              <td className="px-5 py-4 text-sm font-bold text-slate-600">
                {expense.debtors.join(", ") || "None"}
              </td>
              <td className="px-5 py-4">
                {expense.senders.length > 0 ? (
                  <div className="grid gap-1">
                    <p className="text-sm font-bold text-slate-700">
                      {expense.senders.map((sender) => sender.name).join(", ")}
                    </p>
                    <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      {expense.verifiedSenderCount}/{expense.senders.length} verified
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-400">None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(() =>
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
          setBackendStatus({ kind: "ready", snapshot });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          const message =
            error instanceof Error ? error.message : "Could not load Supabase data.";
          setBackendStatus({ kind: "error", message });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const expenseRows = useMemo(
    () =>
      backendStatus.kind === "ready" ? getExpenseRows(backendStatus.snapshot) : [],
    [backendStatus]
  );
  const counts = useMemo(() => getSnapshotCounts(backendStatus), [backendStatus]);

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-950">
      <Sidebar />

      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 lg:hidden"
              type="button"
              aria-label="Open navigation"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-slate-950 md:text-2xl">
                Settlement workspace
              </h1>
              <p className="hidden text-sm font-bold text-slate-500 sm:block">
                Expense visibility and sender verification
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              type="button"
              aria-label="Search"
            >
              <Search className="size-5" aria-hidden="true" />
            </button>
            <button
              className="hidden size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 sm:grid"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <StatusBadge status={backendStatus} />
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 md:px-6">
          <section className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase text-cyan-700">Expenses</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
                Live settlement expenses
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review payers, debtors, senders, and verification status from the
                connected Supabase tables.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                type="button"
              >
                <FileDown className="size-4" aria-hidden="true" />
                Export
              </button>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white hover:bg-slate-800"
                type="button"
              >
                <Plus className="size-4" aria-hidden="true" />
                New expense
              </button>
            </div>
          </section>

          <SummaryStrip counts={counts} />

          <BackendNotice status={backendStatus} />

          <section
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            aria-labelledby="expense-list-title"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center">
              <div>
                <h2
                  className="text-lg font-black text-slate-950"
                  id="expense-list-title"
                >
                  Expense list
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {expenseRows.length} visible rows
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">
                  Index order
                </span>
              </div>
            </div>

            <ExpenseTable rows={expenseRows} status={backendStatus} />
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;

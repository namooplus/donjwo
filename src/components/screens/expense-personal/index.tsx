import { ChevronDown, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BackendSnapshot } from "@/backend/queries";
import type { ISODate, Person } from "@/backend/schema";
import { BackButton } from "@/components/common/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { FloatingPicker } from "@/components/common/FloatingPicker";
import { LoadingCard } from "@/components/common/LoadingCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { formatWon, getExpenseAmountInWon } from "@/features/home/spendingSummary";

type ExpensePersonalScreenProps = {
  snapshot: BackendSnapshot | null;
  onBack: () => void;
};

type PersonalExpense = {
  id: string;
  title: string;
  description: string | null;
  date: ISODate;
  dateLabel: string;
  cost: number;
  payerName: string;
};

export function ExpensePersonalScreen({
  snapshot,
  onBack
}: ExpensePersonalScreenProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const selectedPerson = useMemo(() => {
    if (!snapshot || selectedPersonId === null) {
      return null;
    }

    return snapshot.people.find((person) => person.id === selectedPersonId) ?? null;
  }, [selectedPersonId, snapshot]);
  const personalExpenses = useMemo(() => {
    if (!snapshot || !selectedPerson) {
      return [];
    }

    return getPersonalExpenses(snapshot, selectedPerson);
  }, [selectedPerson, snapshot]);
  const total = personalExpenses.reduce((sum, expense) => sum + expense.cost, 0);
  const expenseGroups = useMemo(
    () => groupExpensesByDate(personalExpenses),
    [personalExpenses]
  );

  useEffect(() => {
    if (!snapshot || snapshot.people.length === 0) {
      return;
    }

    if (snapshot.people.some((person) => person.id === selectedPersonId)) {
      return;
    }

    const defaultPerson =
      snapshot.people.find((person) => person.name === "민서") ?? snapshot.people[0];

    setSelectedPersonId(defaultPerson.id);
  }, [selectedPersonId, snapshot]);

  return (
    <div className="min-h-screen px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      <ScreenHeader
        title={
          <PersonTitle
            people={snapshot?.people ?? []}
            selectedPersonId={selectedPersonId}
            onChange={setSelectedPersonId}
          />
        }
        background="solid"
      />

      <section>
        {!snapshot && <LoadingCard />}

        {snapshot && selectedPerson && (
          <div className="mb-8">
            <p className="text-[15px] font-bold text-[#6b7280]">
              {selectedPerson.name} 사용 금액
            </p>
            <p className="mt-1 text-[34px] font-black leading-tight tracking-normal text-[#111827]">
              {formatWon(total)}원
            </p>
          </div>
        )}

        {snapshot && personalExpenses.length === 0 && (
          <EmptyState message="아직 사용한 내역이 없어요" />
        )}

        {expenseGroups.length > 0 && (
          <div className="grid gap-6">
            {expenseGroups.map((group) => (
              <section key={group.date}>
                <h2 className="sticky top-23 z-[1] bg-[#f2f4f6] py-2 text-[14px] font-bold text-[#6b7280] backdrop-blur">
                  {group.dateLabel}
                </h2>
                <div className="divide-y divide-[#eef1f4]">
                  {group.expenses.map((expense) => (
                    <article
                      className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden py-4"
                      key={expense.id}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f2f6ff] text-[#2f6df6]">
                        <ReceiptText className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[16px] font-bold text-[#111827]">
                          {expense.title}
                        </h3>
                        {expense.description && (
                          <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-[#6b7280]">
                            {expense.description}
                          </p>
                        )}
                        <p className="mt-1 truncate text-[13px] font-semibold text-[#9aa3af]">
                          {expense.payerName} 결제
                        </p>
                      </div>
                      <p className="min-w-max justify-self-end text-right text-[16px] font-bold text-[#111827]">
                        {formatWon(expense.cost)}원
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <BackButton onClick={onBack} />
    </div>
  );
}

type PersonTitleProps = {
  people: Person[];
  selectedPersonId: number | null;
  onChange: (personId: number) => void;
};

function PersonTitle({ people, selectedPersonId, onChange }: PersonTitleProps) {
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
            aria-label="개인별 사용 내역 사람 선택"
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
            ariaLabel="개인별 사용 내역 사람 선택"
            options={options}
            selectedValue={selectedPersonId}
            isOpen={isPickerOpen}
            onChange={selectPerson}
            onClose={() => setIsPickerOpen(false)}
          />
        </span>
        <span className="shrink-0">사용 내역</span>
      </span>
    </span>
  );
}

function getPersonalExpenses(
  snapshot: BackendSnapshot,
  selectedPerson: Person
): PersonalExpense[] {
  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  const debtorsByExpenseId = snapshot.expenseDebtors.reduce(
    (debtors, expenseDebtor) => {
      const expenseDebtors = debtors.get(expenseDebtor.expense) ?? [];
      expenseDebtors.push(expenseDebtor);
      debtors.set(expenseDebtor.expense, expenseDebtors);

      return debtors;
    },
    new Map<number, typeof snapshot.expenseDebtors>()
  );
  const expenses: PersonalExpense[] = [];

  for (const expense of snapshot.expenses) {
    const debtors = debtorsByExpenseId.get(expense.id) ?? [];

    if (!debtors.some((debtor) => debtor.debtor === selectedPerson.id)) {
      continue;
    }

    if (debtors.length === 0) {
      continue;
    }

    expenses.push({
      id: String(expense.id),
      title: expense.title,
      description: expense.description,
      date: expense.date,
      dateLabel: formatKoreanDate(expense.date),
      cost: getExpenseAmountInWon(expense) / debtors.length,
      payerName: peopleById.get(expense.payer)?.name ?? "알 수 없음"
    });
  }

  return expenses.sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return Number(right.id) - Number(left.id);
  });
}

function groupExpensesByDate(expenses: PersonalExpense[]) {
  return expenses.reduce<
    {
      date: string;
      dateLabel: string;
      expenses: PersonalExpense[];
    }[]
  >((groups, expense) => {
    const currentGroup = groups.at(-1);

    if (currentGroup?.date === expense.date) {
      currentGroup.expenses.push(expense);
      return groups;
    }

    groups.push({
      date: expense.date,
      dateLabel: expense.dateLabel,
      expenses: [expense]
    });

    return groups;
  }, []);
}

function formatKoreanDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
}

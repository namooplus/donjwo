import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BackendSnapshot, CreateExpenseInput } from "@/backend/queries";
import { BackButton } from "@/components/common/BackButton";
import {
  type DateParts,
  FloatingDatePicker,
  formatISODate,
  formatKoreanDate,
  toDateParts
} from "@/components/common/FloatingDatePicker";
import { FloatingPicker } from "@/components/common/FloatingPicker";
import { LoadingCard } from "@/components/common/LoadingCard";
import { ScreenHeader } from "@/components/common/ScreenHeader";

type ExpenseAddScreenProps = {
  snapshot: BackendSnapshot | null;
  onBack: () => void;
  onCreateExpense: (input: CreateExpenseInput) => Promise<void>;
};

type PickerFieldProps = {
  label: string;
  ariaLabel: string;
  value: number | null;
  displayValue: string;
  options: { value: number; label: string }[];
  inputName: string;
  onChange: (value: number) => void;
};

type DateFieldProps = {
  label: string;
  ariaLabel: string;
  value: DateParts;
  inputName: string;
  onChange: (value: DateParts) => void;
};

type ExpenseSet = {
  id: number;
  cost: string;
  debtorIds: Set<number>;
};

const createExpenseSet = (id: number): ExpenseSet => ({
  id,
  cost: "",
  debtorIds: new Set()
});

export function ExpenseAddScreen({
  snapshot,
  onBack,
  onCreateExpense
}: ExpenseAddScreenProps) {
  const [name, setName] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1500");
  const [payerId, setPayerId] = useState<number | null>(null);
  const [dateParts, setDateParts] = useState(() => toDateParts(new Date()));
  const [expenseSets, setExpenseSets] = useState<ExpenseSet[]>(() => [
    createExpenseSet(1)
  ]);
  const [nextExpenseSetId, setNextExpenseSetId] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const payerOptions =
    snapshot?.people.map((person) => ({
      value: person.id,
      label: person.name
    })) ?? [];
  const selectedPayerId = payerId ?? snapshot?.people[0]?.id ?? null;
  const selectedPayerName =
    snapshot?.people.find((person) => person.id === selectedPayerId)?.name ?? "선택";
  const canSubmit =
    Boolean(snapshot) &&
    Boolean(name.trim()) &&
    Boolean(selectedPayerId) &&
    Number(exchangeRate) > 0 &&
    expenseSets.length > 0 &&
    expenseSets.every(
      (expenseSet) => Number(expenseSet.cost) > 0 && expenseSet.debtorIds.size > 0
    ) &&
    !isSubmitting;

  const addExpenseSet = () => {
    setExpenseSets((currentSets) => [
      ...currentSets,
      createExpenseSet(nextExpenseSetId)
    ]);
    setNextExpenseSetId((currentId) => currentId + 1);
  };

  const removeExpenseSet = (expenseSetId: number) => {
    setExpenseSets((currentSets) =>
      currentSets.filter((expenseSet) => expenseSet.id !== expenseSetId)
    );
  };

  const updateExpenseSetCost = (expenseSetId: number, cost: string) => {
    setExpenseSets((currentSets) =>
      currentSets.map((expenseSet) =>
        expenseSet.id === expenseSetId ? { ...expenseSet, cost } : expenseSet
      )
    );
  };

  const toggleExpenseSetDebtor = (expenseSetId: number, personId: number) => {
    setExpenseSets((currentSets) =>
      currentSets.map((expenseSet) => {
        if (expenseSet.id !== expenseSetId) {
          return expenseSet;
        }

        const debtorIds = new Set(expenseSet.debtorIds);

        if (debtorIds.has(personId)) {
          debtorIds.delete(personId);
        } else {
          debtorIds.add(personId);
        }

        return {
          ...expenseSet,
          debtorIds
        };
      })
    );
  };

  const submitExpense = async () => {
    if (!snapshot || !selectedPayerId || !canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateExpense({
        name: name.trim(),
        date: formatISODate(dateParts) as CreateExpenseInput["date"],
        payer: selectedPayerId,
        exchange: Number(exchangeRate),
        index: Math.max(0, ...snapshot.expenses.map((expense) => expense.index)) + 1,
        expenseSets: expenseSets.map((expenseSet) => ({
          cost: Number(expenseSet.cost),
          debtorIds: [...expenseSet.debtorIds]
        }))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-7 pb-32 pt-32 sm:px-9 lg:px-12">
      <ScreenHeader title="지출 추가" />

      {!snapshot && <LoadingCard />}

      {snapshot && (
        <form
          className="grid gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await submitExpense();
          }}
        >
          <section className="grid gap-4 rounded-[1.75rem] bg-white p-5">
            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-[#8a94a3]">지출 이름</span>
              <input
                className="h-13 rounded-[1rem] bg-[#f7f8fa] px-4 text-[16px] font-bold text-[#111827] outline-none placeholder:text-[#b8c0cc]"
                name="name"
                type="text"
                value={name}
                placeholder="예: 장보기"
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <DateField
              label="날짜"
              ariaLabel="날짜 선택"
              value={dateParts}
              inputName="date"
              onChange={setDateParts}
            />
          </section>

          <section className="grid gap-4 rounded-[1.75rem] bg-white p-5">
            <PickerField
              label="결제한 사람"
              ariaLabel="결제한 사람 선택"
              value={selectedPayerId}
              displayValue={selectedPayerName}
              options={payerOptions}
              inputName="payer"
              onChange={setPayerId}
            />

            <label className="grid gap-2">
              <span className="text-[13px] font-bold text-[#8a94a3]">환율</span>
              <input
                className="h-13 min-w-0 rounded-[1rem] bg-[#f7f8fa] px-4 text-[16px] font-bold text-[#111827] outline-none placeholder:text-[#b8c0cc]"
                name="exchange"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={exchangeRate}
                placeholder="1500"
                onChange={(event) => setExchangeRate(event.target.value)}
              />
            </label>
          </section>

          <section className="grid gap-3">
            {expenseSets.map((expenseSet, index) => (
              <section
                className="grid gap-4 rounded-[1.75rem] bg-white p-5"
                key={expenseSet.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[13px] font-bold text-[#8a94a3]">
                    지출 항목 {index + 1}
                  </h2>
                  {expenseSets.length > 1 && (
                    <button
                      className="grid size-9 place-items-center rounded-full bg-[#f7f8fa] text-[#8a94a3] transition hover:bg-[#eef1f4] hover:text-[#111827]"
                      type="button"
                      aria-label={`지출 항목 ${index + 1} 삭제`}
                      onClick={() => removeExpenseSet(expenseSet.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <label className="grid gap-2">
                  <span className="text-[13px] font-bold text-[#8a94a3]">금액</span>
                  <input
                    className="h-13 min-w-0 rounded-[1rem] bg-[#f7f8fa] px-4 text-[16px] font-bold text-[#111827] outline-none placeholder:text-[#b8c0cc]"
                    name={`cost-${expenseSet.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={expenseSet.cost}
                    placeholder="0"
                    onChange={(event) =>
                      updateExpenseSetCost(expenseSet.id, event.target.value)
                    }
                  />
                </label>

                <div className="grid gap-3">
                  <h3 className="text-[13px] font-bold text-[#8a94a3]">사용한 사람</h3>
                  <div className="grid gap-2">
                    {snapshot.people.map((person) => {
                      const isSelected = expenseSet.debtorIds.has(person.id);

                      return (
                        <button
                          className={[
                            "flex h-12 items-center justify-between rounded-[1rem] px-4 text-left transition",
                            isSelected ? "bg-[#f2f6ff]" : "bg-[#f7f8fa]"
                          ].join(" ")}
                          key={person.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            toggleExpenseSetDebtor(expenseSet.id, person.id)
                          }
                        >
                          <span className="text-[16px] font-bold text-[#111827]">
                            {person.name}
                          </span>
                          <span
                            className={[
                              "grid size-6 place-items-center rounded-full border-2 transition",
                              isSelected
                                ? "border-[#2f6df6] bg-[#2f6df6] text-white"
                                : "border-[#d7dde6] bg-white text-transparent"
                            ].join(" ")}
                          >
                            <Check className="size-4" aria-hidden="true" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {[...expenseSet.debtorIds].map((personId) => (
                    <input
                      key={personId}
                      name={`debtors-${expenseSet.id}`}
                      type="hidden"
                      value={personId}
                    />
                  ))}
                </div>
              </section>
            ))}

            <button
              className="h-12 rounded-[1.25rem] border border-dashed border-[#c9d0da] bg-white text-[15px] font-bold text-[#2f6df6] transition hover:border-[#2f6df6] hover:bg-[#f2f6ff]"
              type="button"
              onClick={addExpenseSet}
            >
              항목 추가
            </button>
          </section>
        </form>
      )}

      <BackButton
        onClick={onBack}
        action={{
          label: isSubmitting ? "추가 중" : "지출 추가",
          icon: Plus,
          disabled: !canSubmit,
          onClick: submitExpense
        }}
      />
    </div>
  );
}

function DateField({ label, ariaLabel, value, inputName, onChange }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-bold text-[#8a94a3]">{label}</span>
      <div className="relative">
        <input name={inputName} type="hidden" value={formatISODate(value)} />
        <button
          className="flex h-13 w-full min-w-0 items-center justify-between gap-2 rounded-[1rem] bg-[#f7f8fa] px-4 text-left text-[16px] font-bold text-[#111827] outline-none"
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <span className="truncate">{formatKoreanDate(value)}</span>
          <ChevronDown className="size-5 shrink-0 text-[#8a94a3]" aria-hidden="true" />
        </button>
        <FloatingDatePicker
          ariaLabel={ariaLabel}
          value={value}
          isOpen={isOpen}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

function PickerField({
  label,
  ariaLabel,
  value,
  displayValue,
  options,
  inputName,
  onChange
}: PickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectValue = (nextValue: number) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="grid gap-2">
      <span className="text-[13px] font-bold text-[#8a94a3]">{label}</span>
      <div className="relative">
        <input name={inputName} type="hidden" value={value ?? ""} />
        <button
          className="flex h-13 w-full min-w-0 items-center justify-between gap-2 rounded-[1rem] bg-[#f7f8fa] px-4 text-left text-[16px] font-bold text-[#111827] outline-none"
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="size-5 shrink-0 text-[#8a94a3]" aria-hidden="true" />
        </button>
        <FloatingPicker
          ariaLabel={ariaLabel}
          options={options}
          selectedValue={value}
          isOpen={isOpen}
          onChange={selectValue}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

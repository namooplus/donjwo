import { Check, ChevronDown } from "lucide-react";
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

export function ExpenseAddScreen({
  snapshot,
  onBack,
  onCreateExpense
}: ExpenseAddScreenProps) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1500");
  const [payerId, setPayerId] = useState<number | null>(null);
  const [dateParts, setDateParts] = useState(() => toDateParts(new Date()));
  const [debtorIds, setDebtorIds] = useState<Set<number>>(new Set());
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
    Number(cost) > 0 &&
    Number(exchangeRate) > 0 &&
    debtorIds.size > 0 &&
    !isSubmitting;

  const toggleDebtor = (personId: number) => {
    setDebtorIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(personId)) {
        nextIds.delete(personId);
      } else {
        nextIds.add(personId);
      }

      return nextIds;
    });
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

            if (!snapshot || !selectedPayerId || !canSubmit) {
              return;
            }

            setIsSubmitting(true);

            try {
              await onCreateExpense({
                name: name.trim(),
                date: formatISODate(dateParts) as CreateExpenseInput["date"],
                payer: selectedPayerId,
                cost: Number(cost),
                exchange: Number(exchangeRate),
                debtorIds: [...debtorIds],
                index:
                  Math.max(0, ...snapshot.expenses.map((expense) => expense.index)) + 1
              });
            } finally {
              setIsSubmitting(false);
            }
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

            <div className="grid grid-cols-[1fr_1.1fr] gap-3">
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

              <label className="grid gap-2">
                <span className="text-[13px] font-bold text-[#8a94a3]">금액</span>
                <input
                  className="h-13 min-w-0 rounded-[1rem] bg-[#f7f8fa] px-4 text-[16px] font-bold text-[#111827] outline-none placeholder:text-[#b8c0cc]"
                  name="cost"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={cost}
                  placeholder="0"
                  onChange={(event) => setCost(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="grid gap-3 rounded-[1.75rem] bg-white p-5">
            <h2 className="text-[13px] font-bold text-[#8a94a3]">사용한 사람</h2>
            <div className="grid gap-2">
              {snapshot.people.map((person) => {
                const isSelected = debtorIds.has(person.id);

                return (
                  <button
                    className={[
                      "flex h-12 items-center justify-between rounded-[1rem] px-4 text-left transition",
                      isSelected ? "bg-[#f2f6ff]" : "bg-[#f7f8fa]"
                    ].join(" ")}
                    key={person.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleDebtor(person.id)}
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
            {[...debtorIds].map((personId) => (
              <input key={personId} name="debtors" type="hidden" value={personId} />
            ))}
          </section>

          <button
            className="h-13 rounded-[1.25rem] bg-[#111827] text-[16px] font-bold text-white transition hover:bg-[#1f2937]"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? "추가 중" : "추가하기"}
          </button>
        </form>
      )}

      <BackButton onClick={onBack} />
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

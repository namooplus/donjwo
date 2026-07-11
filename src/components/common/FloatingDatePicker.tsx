export type DateParts = {
  year: number;
  month: number;
  day: number;
};

type FloatingDatePickerProps = {
  ariaLabel: string;
  value: DateParts;
  isOpen: boolean;
  onChange: (value: DateParts) => void;
  onClose: () => void;
};

const today = new Date();

export function FloatingDatePicker({
  ariaLabel,
  value,
  isOpen,
  onChange,
  onClose
}: FloatingDatePickerProps) {
  if (!isOpen) {
    return null;
  }

  const years = Array.from(
    { length: 5 },
    (_, index) => today.getFullYear() - 2 + index
  );
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from(
    { length: getDaysInMonth(value.year, value.month) },
    (_, index) => index + 1
  );

  const updateDate = (nextParts: Partial<DateParts>) => {
    const mergedParts = { ...value, ...nextParts };
    const maxDay = getDaysInMonth(mergedParts.year, mergedParts.month);

    onChange({
      ...mergedParts,
      day: Math.min(mergedParts.day, maxDay)
    });
  };

  return (
    <>
      <button
        className="fixed inset-0 z-20 cursor-default"
        type="button"
        aria-label="닫기"
        onClick={onClose}
      />

      <div
        className="absolute top-full left-0 z-30 mt-3 w-[19rem] max-w-[calc(100vw-3.5rem)] rounded-[1.25rem] border border-white/80 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-label={ariaLabel}
      >
        <p className="px-1 pb-3 text-[16px] font-black text-[#111827]">
          {formatKoreanDate(value)}
        </p>
        <div className="grid grid-cols-3 gap-2 rounded-[1rem] bg-[#f7f8fa] p-2">
          <DateWheel
            label="연도"
            unit="년"
            options={years}
            value={value.year}
            onChange={(year) => updateDate({ year })}
          />
          <DateWheel
            label="월"
            unit="월"
            options={months}
            value={value.month}
            onChange={(month) => updateDate({ month })}
          />
          <DateWheel
            label="일"
            unit="일"
            options={days}
            value={value.day}
            onChange={(day) => updateDate({ day })}
          />
        </div>
      </div>
    </>
  );
}

type DateWheelProps = {
  label: string;
  unit: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
};

function DateWheel({ label, unit, options, value, onChange }: DateWheelProps) {
  return (
    <div>
      <span className="sr-only">{label}</span>
      <div className="max-h-36 snap-y overflow-y-auto rounded-[0.875rem] bg-white p-1">
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <button
              className={[
                "h-10 w-full snap-center rounded-[0.75rem] text-[15px] font-bold transition",
                isSelected ? "bg-[#111827] text-white" : "text-[#8a94a3]"
              ].join(" ")}
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
            >
              {option}
              {unit}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function toDateParts(date: Date): DateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

export function formatISODate({ year, month, day }: DateParts) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatKoreanDate({ year, month, day }: DateParts) {
  return `${year}년 ${month}월 ${day}일`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

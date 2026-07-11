import { Check } from "lucide-react";

type FloatingPickerOption<T extends string | number> = {
  value: T;
  label: string;
};

type FloatingPickerProps<T extends string | number> = {
  ariaLabel: string;
  options: FloatingPickerOption<T>[];
  selectedValue: T | null;
  isOpen: boolean;
  onChange: (value: T) => void;
  onClose: () => void;
};

export function FloatingPicker<T extends string | number>({
  ariaLabel,
  options,
  selectedValue,
  isOpen,
  onChange,
  onClose
}: FloatingPickerProps<T>) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        className="fixed inset-0 z-20 cursor-default"
        type="button"
        aria-label="닫기"
        onClick={onClose}
      />

      <div
        className="absolute top-full left-0 z-30 mt-3 w-52 overflow-hidden rounded-[1.25rem] border border-white/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
        role="listbox"
        aria-label={ariaLabel}
      >
        <div className="max-h-64 overflow-y-auto p-1.5">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                className={[
                  "flex h-12 w-full items-center justify-between rounded-[0.875rem] px-3.5 text-left text-[16px] font-bold transition",
                  isSelected
                    ? "bg-[#f2f6ff] text-[#111827]"
                    : "text-[#4b5563] active:bg-[#f3f4f6]"
                ].join(" ")}
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onChange(option.value)}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check
                    className="size-5 shrink-0 text-[#2f6df6]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

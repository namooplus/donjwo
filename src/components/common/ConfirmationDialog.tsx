import { LoaderCircle } from "lucide-react";
import { useId } from "react";
import { createPortal } from "react-dom";

type ConfirmationDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  variant?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

const confirmButtonClassName = {
  primary: "bg-[#111827] text-white hover:bg-[#1f2937] disabled:bg-[#c9d0da]",
  danger: "bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:bg-[#f0a7a7]"
};

export function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  isPending = false,
  variant = "primary",
  onCancel,
  onConfirm
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#111827]/40 px-7 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-[1.5rem] bg-white p-5 shadow-[0_24px_72px_rgba(15,23,42,0.24)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2
          className="text-[20px] font-black tracking-normal text-[#111827]"
          id={titleId}
        >
          {title}
        </h2>
        <p
          className="mt-2 text-[14px] font-semibold leading-6 text-[#6b7280]"
          id={descriptionId}
        >
          {description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="h-12 rounded-[1rem] bg-[#f7f8fa] text-[15px] font-bold text-[#111827] transition hover:bg-[#eef1f4]"
            type="button"
            disabled={isPending}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`flex h-12 items-center justify-center gap-2 rounded-[1rem] text-[15px] font-bold transition ${confirmButtonClassName[variant]}`}
            type="button"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

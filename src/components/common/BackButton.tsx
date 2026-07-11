import { ArrowLeft, type LucideIcon } from "lucide-react";

type BackButtonProps = {
  onClick: () => void;
  action?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "danger";
  };
};

export function BackButton({ onClick, action }: BackButtonProps) {
  if (action) {
    const ActionIcon = action.icon;
    const actionClassName =
      action.variant === "danger"
        ? "bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:bg-[#f0a7a7]"
        : "bg-[#111827] text-white hover:bg-[#1f2937] disabled:bg-[#c9d0da]";

    return (
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/88 p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <button
          className="grid size-12 place-items-center rounded-full text-[#111827] transition hover:bg-white"
          type="button"
          aria-label="뒤로 가기"
          onClick={onClick}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          className={`grid size-12 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:text-white ${actionClassName}`}
          type="button"
          aria-label={action.label}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          <ActionIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button
      className="fixed bottom-6 left-1/2 z-20 grid size-14 -translate-x-1/2 place-items-center rounded-full border border-white/80 bg-white/88 text-[#111827] shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:bg-white"
      type="button"
      aria-label="뒤로 가기"
      onClick={onClick}
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </button>
  );
}

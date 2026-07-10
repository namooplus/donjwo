import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
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

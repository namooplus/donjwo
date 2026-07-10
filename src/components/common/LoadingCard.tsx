export function LoadingCard() {
  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] bg-white p-5 text-[15px] font-semibold leading-6 text-[#8a94a3]">
      <span
        className="size-5 animate-spin rounded-full border-2 border-[#d9dee6] border-t-[#111827]"
        aria-hidden="true"
      />
      <span>지출을 불러오는 중이에요.</span>
    </div>
  );
}

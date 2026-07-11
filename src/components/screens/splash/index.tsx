export function SplashScreen() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-[#f2f4f6] px-7 text-[#111827]"
      role="status"
      aria-label="지출을 불러오는 중이에요"
    >
      <div className="grid justify-items-center gap-10">
        <h1 className="bg-[linear-gradient(135deg,#374151_0%,#6478f3_34%,#38bdf8_62%,#45d39b_100%)] bg-clip-text text-[64px] font-black leading-none tracking-normal text-transparent">
          돈줘
        </h1>
        <span
          className="size-6 animate-spin rounded-full border-2 border-[#d9dee6] border-t-[#111827]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

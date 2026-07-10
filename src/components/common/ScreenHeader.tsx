type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <header className="fixed left-1/2 top-0 z-10 w-full max-w-[430px] -translate-x-1/2 bg-linear-to-b from-[#f2f4f6] from-55% to-[#f2f4f6]/0 px-5 pb-8 pt-5">
      <h1 className="text-[#111827] text-4xl font-bold tracking-normal">{title}</h1>
    </header>
  );
}

import type { ReactNode } from "react";

type ScreenHeaderProps = {
  title: ReactNode;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <header className="fixed left-0 top-0 z-10 w-full bg-linear-to-b from-[#f2f4f6] from-55% to-[#f2f4f6]/0 px-7 pb-8 pt-5 sm:px-9 lg:px-12">
      <h1 className="text-[#111827] text-4xl font-bold tracking-normal">{title}</h1>
    </header>
  );
}

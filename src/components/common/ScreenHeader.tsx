import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ScreenHeaderProps = {
  title: ReactNode;
  background?: "gradient" | "solid";
  leadingAction?: {
    icon: LucideIcon;
    label: string;
    isPending?: boolean;
    onClick: () => void;
  };
};

export function ScreenHeader({
  title,
  background = "gradient",
  leadingAction
}: ScreenHeaderProps) {
  const LeadingIcon = leadingAction?.icon;

  return (
    <header
      className={[
        "fixed left-0 top-0 z-10 w-full px-7 pb-8 pt-5 sm:px-9 lg:px-12",
        background === "gradient"
          ? "bg-linear-to-b from-[#f2f4f6] from-55% to-[#f2f4f6]/0"
          : "bg-[#f2f4f6]"
      ].join(" ")}
    >
      <div className="flex min-h-10 items-center justify-between gap-3">
        <h1 className="min-w-0 text-[28px] font-bold leading-tight tracking-normal text-[#111827]">
          {title}
        </h1>
        {leadingAction && LeadingIcon && (
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full text-[#111827] transition disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
            aria-label={leadingAction.label}
            disabled={leadingAction.isPending}
            onClick={leadingAction.onClick}
          >
            <LeadingIcon
              className={[
                "size-5",
                leadingAction.isPending ? "animate-spin" : undefined
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </header>
  );
}

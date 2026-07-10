import { type TabKey, tabs } from "../navigation/tabs";

type FloatingTabsProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

export function FloatingTabs({ activeTab, onChange }: FloatingTabsProps) {
  return (
    <nav
      className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/88 p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            className={[
              "flex h-12 min-w-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition",
              isActive ? "floating-tab-active" : "floating-tab-inactive"
            ].join(" ")}
            key={tab.key}
            type="button"
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab.key)}
          >
            <Icon className="size-5" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

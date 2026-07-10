import { ArrowDownLeft, Home, Send } from "lucide-react";

export type TabKey = "home" | "send" | "receive";

type Tab = {
  key: TabKey;
  label: string;
  icon: typeof Home;
};

export const tabs: Tab[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "send", label: "Send", icon: Send },
  { key: "receive", label: "Receive", icon: ArrowDownLeft }
];

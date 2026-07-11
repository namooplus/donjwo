import { Inbox } from "lucide-react";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="grid min-h-[calc(100vh-16rem)] place-items-center" role="status">
      <div className="grid justify-items-center gap-4">
        <span className="grid size-16 place-items-center text-[#c9d0da]">
          <Inbox className="size-7" aria-hidden="true" />
        </span>
        <p className="text-[15px] font-bold text-[#8a94a3]">{message}</p>
      </div>
    </div>
  );
}

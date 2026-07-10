import { ChevronRight, Plus, Send, ShieldCheck } from "lucide-react";

const contacts = [
  { name: "Mina", label: "Recent", color: "bg-[#eaf2ff] text-[#2b6eea]" },
  { name: "Joon", label: "Friend", color: "bg-[#ecf9f2] text-[#14804a]" },
  { name: "Hana", label: "Saved", color: "bg-[#fff1dc] text-[#c46b00]" }
];

export function SendPage() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-32">
      <section className="rounded-[2rem] bg-white p-5">
        <p className="text-sm font-semibold text-[#8a94a3]">Send money</p>
        <div className="mt-6 flex items-end gap-2">
          <span className="pb-2 text-3xl font-bold text-[#8a94a3]">$</span>
          <h1 className="text-6xl font-bold tracking-normal text-[#111827]">125</h1>
          <span className="pb-3 text-xl font-bold text-[#8a94a3]">.00</span>
        </div>
        <div className="mt-6 rounded-3xl bg-[#f4f6f8] px-4 py-4">
          <p className="text-sm font-medium text-[#8a94a3]">To</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#eaf2ff] text-sm font-bold text-[#2b6eea]">
                MN
              </span>
              <div>
                <p className="font-bold text-[#111827]">Mina Kim</p>
                <p className="text-sm font-medium text-[#8a94a3]">m.kim@yugain</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-[#8a94a3]" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-white p-2">
        <div className="flex items-center justify-between px-3 py-3">
          <h2 className="text-lg font-bold text-[#111827]">People</h2>
          <button
            className="grid size-9 place-items-center rounded-full bg-[#111827] text-white"
            type="button"
            aria-label="Add recipient"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-1">
          {contacts.map((contact) => (
            <button
              className="flex items-center gap-3 rounded-3xl px-3 py-3 text-left hover:bg-[#f7f8fa]"
              key={contact.name}
              type="button"
            >
              <span
                className={`grid size-12 place-items-center rounded-full text-sm font-bold ${contact.color}`}
              >
                {contact.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111827]">{contact.name}</p>
                <p className="text-sm font-medium text-[#8a94a3]">{contact.label}</p>
              </div>
              <Send className="size-5 text-[#8a94a3]" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <button
        className="flex h-16 items-center justify-center gap-2 rounded-[1.5rem] bg-[#2f6df6] text-[17px] font-bold text-white shadow-[0_16px_32px_rgba(47,109,246,0.24)]"
        type="button"
      >
        <ShieldCheck className="size-5" aria-hidden="true" />
        Confirm transfer
      </button>
    </div>
  );
}

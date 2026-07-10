import { QrCode, ReceiptText } from "lucide-react";

const qrCells = Array.from({ length: 25 }, (_, index) => ({
  id: `qr-cell-${index + 1}`,
  filled: [0, 1, 2, 5, 7, 10, 11, 12, 18, 20, 22, 23, 24].includes(index)
}));

export function ReceiveTab() {
  return (
    <div className="grid gap-5 px-5 pb-32 pt-32">
      <section className="rounded-[2rem] bg-white p-5 text-center">
        <p className="text-sm font-semibold text-[#8a94a3]">Receive money</p>
        <h1 className="mt-2 text-3xl font-bold text-[#111827]">Share your code</h1>

        <div className="mx-auto mt-7 grid size-64 max-w-full place-items-center rounded-[2rem] bg-[#f4f6f8] p-5">
          <div className="grid size-full grid-cols-5 gap-2 rounded-3xl bg-white p-4">
            {qrCells.map((cell) => (
              <span
                className={[
                  "rounded-md",
                  cell.filled ? "bg-[#111827]" : "bg-[#dfe5ec]"
                ].join(" ")}
                key={cell.id}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-[#f4f6f8] px-4 py-4 text-left">
          <p className="text-sm font-medium text-[#8a94a3]">Account</p>
          <p className="mt-1 font-bold text-[#111827]">Yugain Wallet 0429</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          className="flex h-28 flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-white text-[#111827]"
          type="button"
        >
          <QrCode className="size-6" aria-hidden="true" />
          <span className="font-semibold">Show QR</span>
        </button>
        <button
          className="flex h-28 flex-col items-center justify-center gap-3 rounded-[1.5rem] bg-white text-[#111827]"
          type="button"
        >
          <ReceiptText className="size-6" aria-hidden="true" />
          <span className="font-semibold">Request</span>
        </button>
      </section>
    </div>
  );
}

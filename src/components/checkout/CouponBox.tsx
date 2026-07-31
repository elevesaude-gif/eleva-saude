import { useState } from "react";
import type { SellerSlug } from "@/types/checkout";

type Props = { seller: SellerSlug; applied: boolean; onApply: (applied: boolean) => void };

export function CouponBox({ seller, applied, onApply }: Props) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const apply = () => {
    const expected = `${seller.toUpperCase()}10`;
    const valid = code.trim().toUpperCase() === expected;
    onApply(valid);
    setMessage(valid ? "Cupom aplicado! Você ganhou 10% de desconto." : `Esse cupom não é válido para este atendimento. Tente ${expected}.`);
  };
  return (
    <section className="rounded-3xl border border-[#dfe8e3] bg-white p-5 sm:p-6">
      <h2 className="font-bold text-[#1F2933]">Tem um cupom?</h2>
      <div className="mt-3 flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} disabled={applied} placeholder="Digite o código"
          className="min-w-0 flex-1 rounded-xl border border-[#d9e2dd] px-3.5 py-3 text-sm uppercase outline-none focus:border-[#2F7D5C]" />
        <button type="button" onClick={apply} disabled={applied} className="rounded-xl border border-[#2F7D5C] px-4 text-sm font-bold text-[#2F7D5C] hover:bg-[#EAF5EF] disabled:opacity-50">Aplicar</button>
      </div>
      {message && <p className={`mt-2 text-xs ${applied ? "text-[#2F7D5C]" : "text-[#a45f43]"}`}>{message}</p>}
    </section>
  );
}

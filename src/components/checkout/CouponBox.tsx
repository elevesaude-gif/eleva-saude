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
    setMessage(valid ? "Cupom aplicado. Seu desconto de 10% já está no resumo!" : "Não encontramos esse cupom para este atendimento. Confira o código com seu vendedor.");
  };
  return (
    <section className="checkout-card">
      <div className="section-heading">
        <span className="section-icon">%</span>
        <div><p className="section-kicker">Cupom</p><h2 className="section-title">Cupom de desconto</h2><p className="section-description">O cupom precisa ser fornecido pelo(a) vendedor(a).</p></div>
      </div>
      <div className="flex gap-2 rounded-2xl bg-[#F7F8FA] p-2 ring-1 ring-[#E6E8ED]">
        <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); if (message) setMessage(""); }} disabled={applied} placeholder="DIGITE SEU CUPOM" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold uppercase tracking-wide text-[#0D1B2A] outline-none placeholder:text-[#344563]/55" />
        <button type="button" onClick={apply} disabled={applied || !code.trim()} className="rounded-xl bg-[#0D1B2A] px-5 text-sm font-bold text-white transition hover:bg-[#344563] hover:ring-4 hover:ring-[#C9C6F0] disabled:bg-[#E6E8ED] disabled:text-[#344563]">{applied ? "Aplicado" : "Aplicar"}</button>
      </div>
      {message && <div className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${applied ? "border-[#C9C6F0] bg-[#C9C6F0]/35 text-[#0D1B2A]" : "border-[#E6E8ED] bg-[#F7F8FA] text-[#344563]"}`}><span>{applied ? "✓" : "!"}</span><p>{message}</p></div>}
    </section>
  );
}

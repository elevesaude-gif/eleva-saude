import { useState } from "react";
import { loadCoupons, validateCoupon, type Coupon } from "@/lib/coupons";
import type { SellerSlug } from "@/types/checkout";

type Props = { seller: SellerSlug; subtotal: number; appliedCoupon: Coupon | null; onApply: (coupon: Coupon | null) => void };

export function CouponBox({ seller, subtotal, appliedCoupon, onApply }: Props) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const apply = () => {
    const result = validateCoupon(loadCoupons(), code, seller, subtotal);
    setMessage(result.message); setSuccess(result.valid); onApply(result.valid ? result.coupon : null);
  };
  const remove = () => { onApply(null); setCode(""); setMessage("Cupom removido do pedido."); setSuccess(false); };
  const currentValidation = appliedCoupon ? validateCoupon([appliedCoupon], appliedCoupon.code, seller, subtotal) : null;
  const visibleMessage = currentValidation?.message ?? message;
  const visibleSuccess = currentValidation?.valid ?? success;
  return <section className="checkout-card">
    <div className="section-heading"><span className="section-icon">%</span><div><p className="section-kicker">Cupom</p><h2 className="section-title">Cupom de desconto</h2><p className="section-description">O cupom precisa ser fornecido pelo(a) vendedor(a).</p></div></div>
    <div className="flex gap-2 rounded-2xl bg-[#F7F8FA] p-2 ring-1 ring-[#E6E8ED]"><input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setMessage(""); }} disabled={Boolean(appliedCoupon)} placeholder="DIGITE SEU CUPOM" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold uppercase tracking-wide text-[#0D1B2A] outline-none placeholder:text-[#344563]/55" /><button type="button" onClick={appliedCoupon ? remove : apply} disabled={!appliedCoupon && !code.trim()} className={`rounded-xl px-5 text-sm font-bold transition ${appliedCoupon ? "bg-[#E6E8ED] text-[#0D1B2A]" : code.trim() ? "bg-[#047857] text-white hover:bg-[#065F46]" : "bg-[#E6E8ED] text-[#344563]"}`}>{appliedCoupon ? "Remover" : "Aplicar"}</button></div>
    {visibleMessage && <div role="status" className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 ${visibleSuccess ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" : "border-[#B42318]/20 bg-[#FEF3F2] text-[#B42318]"}`}><span>{visibleSuccess ? "✓" : "!"}</span><p>{visibleMessage}</p></div>}
  </section>;
}

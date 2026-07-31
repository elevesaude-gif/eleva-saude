"use client";

import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { formatCurrency } from "@/lib/currency";
import { products, sellers, shippingOptions } from "@/lib/mock-data";
import type { Category, CustomerData, SellerSlug } from "@/types/checkout";
import { CartSummary, MobileCartBar } from "./CartSummary";
import { CategoryTabs } from "./CategoryTabs";
import { CheckoutHeader } from "./CheckoutHeader";
import { CouponBox } from "./CouponBox";
import { CustomerForm } from "./CustomerForm";
import { ProductCard } from "./ProductCard";
import { ShippingOptions } from "./ShippingOptions";
import { Stepper } from "./Stepper";

const emptyCustomer: CustomerData = {
  fullName: "", cpf: "", whatsapp: "", email: "", zipCode: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", reference: "",
};

export function CheckoutPage({ seller }: { seller: SellerSlug }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<"Todos" | Category>("Todos");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState(emptyCustomer);
  const [shippingId, setShippingId] = useState("jadlog");
  const [couponApplied, setCouponApplied] = useState(false);
  const [ready, setReady] = useState(false);

  const items = products.filter((product) => quantities[product.id]).map((product) => ({ ...product, quantity: quantities[product.id] }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingOptions.find((option) => option.id === shippingId)!;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shipping.price;
  const filtered = useMemo(() => category === "Todos" ? products : products.filter((product) => product.category === category), [category]);
  const setQuantity = (id: string, delta: number) => setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));
  const goToSummary = () => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const finish = () => {
    const form = document.getElementById("checkout-form") as HTMLFormElement | null;
    if (form?.reportValidity()) setReady(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0D1B2A]">
      <CheckoutHeader sellerName={sellers[seller]} />
      <Stepper step={step} />
      <main className={`mx-auto max-w-7xl px-4 sm:px-6 ${step === 1 ? "pb-32 lg:pb-20" : "pb-20"}`}>
        {step === 1 ? (
          <>
            <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0D1B2A] via-[#344563] to-[#0D1B2A] px-5 py-7 text-white shadow-[0_18px_50px_rgba(13,27,42,.2)] sm:px-9 sm:py-8">
              <span className="absolute -right-16 -top-24 size-64 rounded-full border-[45px] border-[#C9C6F0]/10" />
              <span className="absolute -bottom-24 right-28 size-48 rounded-full bg-[#C9C6F0]/15 blur-2xl" />
              <div className="relative flex max-w-2xl flex-col items-start">
                <BrandLogo negative size="small" className="mb-3" />
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#C9C6F0]">Ambiente privado de fechamento</p>
                <h1 className="font-serif text-[29px] font-semibold leading-[1.08] tracking-[-.025em] sm:text-[38px]">Finalize seu pedido com a eLeve Saúde</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Ambiente seguro para concluir o pedido orientado pela nossa equipe.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C9C6F0] px-3 py-2 text-[11px] font-bold text-[#0D1B2A]">
                  <span aria-hidden>✓</span> Atendimento personalizado com {sellers[seller]}
                </div>
              </div>
            </section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Recomendados no atendimento</p><h2 className="mt-1 text-2xl font-bold tracking-[-.03em] text-[#0D1B2A]">Itens disponíveis para seu pedido</h2></div>
              <span className="hidden text-xs text-[#344563] sm:block">{products.length} opções orientadas pela equipe</span>
            </div>
            <CategoryTabs active={category} onChange={setCategory} />
            <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => <ProductCard key={product.id} product={product} quantity={quantities[product.id] ?? 0} onAdd={() => setQuantity(product.id, 1)} onRemove={() => setQuantity(product.id, -1)} />)}
              </div>
              <CartSummary items={items} subtotal={subtotal} sellerName={sellers[seller]} onAdd={(id) => setQuantity(id, 1)} onRemove={(id) => setQuantity(id, -1)} onContinue={goToSummary} />
            </div>
            <MobileCartBar items={items} subtotal={subtotal} onContinue={goToSummary} />
          </>
        ) : (
          <form id="checkout-form" onSubmit={(event) => event.preventDefault()}>
            <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mb-5 inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-bold text-[#0D1B2A] hover:bg-[#C9C6F0]">← Voltar ao catálogo</button>
            <div className="mb-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Última etapa</p>
              <h1 className="mt-1 font-serif text-3xl font-semibold tracking-[-.03em] text-[#0D1B2A] sm:text-4xl">Resumo do seu pedido</h1>
              <p className="mt-2 text-sm text-[#344563]">Revise os itens orientados no atendimento e complete seus dados.</p>
            </div>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-5">
                <section className="checkout-card">
                  <div className="section-heading"><span className="section-icon">◇</span><div><p className="section-kicker">Seu pedido</p><h2 className="section-title">Itens escolhidos</h2><p className="section-description">{itemCount} {itemCount === 1 ? "item escolhido" : "itens escolhidos"} com acompanhamento de {sellers[seller]}.</p></div></div>
                  <div className="divide-y divide-[#E6E8ED]">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl text-xl text-[#0D1B2A]" style={{ background: item.accent }}>{item.icon}</div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="text-xs text-[#344563]">{item.quantity} × {formatCurrency(item.price)}</p></div>
                        <strong className="text-sm">{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                </section>
                <CustomerForm data={customer} onChange={setCustomer} />
                <ShippingOptions selected={shippingId} onSelect={setShippingId} />
                <CouponBox seller={seller} applied={couponApplied} onApply={setCouponApplied} />
              </div>
              <aside className="overflow-hidden rounded-[28px] border border-[#E6E8ED] bg-white shadow-[0_18px_55px_rgba(13,27,42,.09)] lg:sticky lg:top-28">
                <div className="bg-[#0D1B2A] p-5 text-white">
                  <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#C9C6F0]">Pagamento seguro</p>
                  <div className="mt-1 flex items-center justify-between"><h2 className="text-xl font-bold">Total do pedido</h2><span className="rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-semibold text-[#047857]">✓ Protegido</span></div>
                  <p className="mt-2 text-xs text-white/70">Atendimento personalizado com <strong className="text-white">{sellers[seller]}</strong></p>
                </div>
                <div className="p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-[#344563]">Itens ({itemCount})</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                    {couponApplied && <div className="flex justify-between rounded-lg bg-[#C9C6F0]/40 px-2 py-1.5 text-[#0D1B2A]"><span>Desconto de 10%</span><strong>− {formatCurrency(discount)}</strong></div>}
                    <div className="flex justify-between"><span className="text-[#344563]">Frete</span><span className="font-semibold">{formatCurrency(shipping.price)}</span></div>
                    <div className="rounded-xl bg-[#F7F8FA] p-3 text-xs text-[#344563]"><strong className="block text-[#0D1B2A]">{shipping.name}</strong><span>{shipping.estimate}</span></div>
                  </div>
                  <div className="my-5 h-px bg-[#E6E8ED]" />
                  <div className="flex items-end justify-between"><div><span className="text-xs font-semibold text-[#344563]">Total a pagar</span><p className="text-[10px] text-[#344563]">em ambiente seguro</p></div><strong className="text-3xl tracking-[-.05em] text-[#0D1B2A]">{formatCurrency(total)}</strong></div>
                  <p className="mt-4 text-center text-[11px] leading-5 text-[#344563]">Você será direcionado para o ambiente seguro da InfinitePay.</p>
                  <button type="button" onClick={finish} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#047857] px-4 py-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(4,120,87,.28)] transition hover:bg-[#065F46]">Finalizar no pagamento seguro <span>→</span></button>
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-2 text-[10px] font-semibold text-[#047857]">✓ Seus dados estão protegidos</div>
                </div>
              </aside>
            </div>
          </form>
        )}
      </main>
      <footer className="border-t border-[#E6E8ED] bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2"><BrandLogo /><p className="hidden text-[11px] text-[#344563] md:block">Um caminho mais leve para a sua saúde</p></div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#344563]"><span>✓ Pagamento seguro</span><span>♡ Atendimento personalizado</span></div>
        </div>
        <p className="mx-auto mt-6 max-w-7xl border-t border-[#E6E8ED] pt-4 text-center text-[10px] leading-4 text-[#344563]">Ambiente de demonstração local. Gateway ainda não integrado.</p>
      </footer>
      {ready && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#0D1B2A]/70 backdrop-blur-sm sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <div className="relative w-full max-w-md overflow-hidden rounded-t-[30px] bg-white shadow-2xl sm:rounded-[30px]">
            <button type="button" onClick={() => setReady(false)} aria-label="Fechar modal" className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/10 text-xl text-white hover:bg-[#C9C6F0] hover:text-[#0D1B2A]">×</button>
            <div className="relative overflow-hidden bg-[#0D1B2A] px-7 pb-8 pt-9 text-center text-white">
              <span className="absolute -right-10 -top-12 size-36 rounded-full border-[25px] border-[#C9C6F0]/10" />
              <div className="relative mx-auto grid size-16 place-items-center rounded-[22px] bg-[#C9C6F0]"><BrandLogo compact /></div>
              <p className="relative mt-5 text-[9px] font-bold uppercase tracking-[.18em] text-[#C9C6F0]">Pedido EL-260731-{seller === "isabela" ? "01" : "02"}</p>
              <h2 id="payment-title" className="relative mt-2 font-serif text-2xl font-semibold">Pedido pronto para pagamento</h2>
            </div>
            <div className="p-6 sm:p-7">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F7F8FA] p-4"><span className="text-[9px] font-bold uppercase tracking-wider text-[#344563]">Total</span><strong className="mt-1 block text-xl text-[#0D1B2A]">{formatCurrency(total)}</strong></div>
                <div className="rounded-2xl bg-[#F7F8FA] p-4"><span className="text-[9px] font-bold uppercase tracking-wider text-[#344563]">Vendedor(a)</span><strong className="mt-1 block text-base text-[#0D1B2A]">{sellers[seller]}</strong></div>
              </div>
              <p className="mt-5 text-center text-sm leading-6 text-[#344563]">Na próxima etapa, este botão criará automaticamente um checkout seguro na InfinitePay usando a InfiniteTag <strong className="break-all text-[#0D1B2A]">stefane-santos-518</strong>.</p>
              <button type="button" onClick={() => setReady(false)} className="mt-6 w-full rounded-2xl bg-[#047857] py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(4,120,87,.2)] hover:bg-[#065F46]">Entendi</button>
              <button type="button" onClick={() => setReady(false)} className="mt-2 w-full rounded-2xl py-3 text-sm font-bold text-[#0D1B2A] hover:bg-[#C9C6F0]">Voltar ao pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

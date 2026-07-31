"use client";

import { useMemo, useState } from "react";
import { CartSummary } from "./CartSummary";
import { CategoryTabs } from "./CategoryTabs";
import { CheckoutHeader } from "./CheckoutHeader";
import { CouponBox } from "./CouponBox";
import { CustomerForm } from "./CustomerForm";
import { ProductCard } from "./ProductCard";
import { ShippingOptions } from "./ShippingOptions";
import { Stepper } from "./Stepper";
import { formatCurrency } from "@/lib/currency";
import { products, sellers, shippingOptions } from "@/lib/mock-data";
import type { Category, CustomerData, SellerSlug } from "@/types/checkout";

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
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingOptions.find((option) => option.id === shippingId)!;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shipping.price;
  const filtered = useMemo(() => category === "Todos" ? products : products.filter((product) => product.category === category), [category]);
  const setQuantity = (id: string, delta: number) => setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));

  const finish = () => {
    const form = document.getElementById("checkout-form") as HTMLFormElement | null;
    if (form?.reportValidity()) setReady(true);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#1F2933]">
      <CheckoutHeader sellerName={sellers[seller]} />
      <Stepper step={step} />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {step === 1 ? (
          <>
            <div className="mb-7 max-w-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#D19A35]">Cuidado escolhido por você</p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Encontre o que faz sentido para sua jornada.</h1>
              <p className="mt-3 text-sm leading-6 text-[#69756f]">Soluções de cuidado e bem-estar com atendimento próximo de {sellers[seller]}.</p>
            </div>
            <CategoryTabs active={category} onChange={setCategory} />
            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_330px]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => <ProductCard key={product.id} product={product} quantity={quantities[product.id] ?? 0} onAdd={() => setQuantity(product.id, 1)} onRemove={() => setQuantity(product.id, -1)} />)}
              </div>
              <CartSummary items={items} subtotal={subtotal} onAdd={(id) => setQuantity(id, 1)} onRemove={(id) => setQuantity(id, -1)} onContinue={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </div>
          </>
        ) : (
          <form id="checkout-form" onSubmit={(e) => e.preventDefault()}>
            <button type="button" onClick={() => setStep(1)} className="mb-5 text-sm font-semibold text-[#2F7D5C] hover:underline">← Voltar aos produtos</button>
            <div className="mb-6"><h1 className="font-serif text-3xl font-semibold sm:text-4xl">Revise e complete seu pedido.</h1><p className="mt-2 text-sm text-[#69756f]">Falta pouco para deixar tudo pronto.</p></div>
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <CustomerForm data={customer} onChange={setCustomer} />
                <ShippingOptions selected={shippingId} onSelect={setShippingId} />
                <CouponBox seller={seller} applied={couponApplied} onApply={setCouponApplied} />
              </div>
              <aside className="rounded-3xl border border-[#dfe8e3] bg-white p-5 shadow-[0_14px_45px_rgba(31,41,51,.07)] lg:sticky lg:top-5">
                <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Resumo do pedido</h2><span className="text-xs text-[#748079]">com {sellers[seller]}</span></div>
                <div className="my-5 space-y-4">
                  {items.map((item) => <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-[#59655f]">{item.quantity}× {item.name}</span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}
                </div>
                <div className="space-y-3 border-t border-[#e3eae6] pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-[#69756f]">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  {couponApplied && <div className="flex justify-between text-[#2F7D5C]"><span>Desconto (10%)</span><span>− {formatCurrency(discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-[#69756f]">Frete</span><span>{formatCurrency(shipping.price)}</span></div>
                  <p className="text-xs text-[#87918c]">{shipping.name} · {shipping.estimate}</p>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-[#e3eae6] pt-4"><span className="font-semibold">Total</span><strong className="text-2xl text-[#2F7D5C]">{formatCurrency(total)}</strong></div>
                <button type="button" onClick={finish} className="mt-5 w-full rounded-2xl bg-[#2F7D5C] px-4 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,125,92,.22)] hover:bg-[#276d50]">Ir para pagamento seguro →</button>
                <p className="mt-3 text-center text-[11px] text-[#87918c]">Ambiente protegido para finalizar sua compra</p>
              </aside>
            </div>
          </form>
        )}
      </main>
      <footer className="border-t border-[#e0e8e3] bg-white px-4 py-6 text-center text-xs text-[#7b8680]">Eleva Saúde · Saúde, cuidado e bem-estar em uma jornada mais leve</footer>
      {ready && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#16231d]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-t-[28px] bg-white p-7 text-center shadow-2xl sm:rounded-[28px]">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#EAF5EF] text-3xl text-[#2F7D5C]">✓</div>
            <h2 className="mt-5 font-serif text-2xl font-semibold">Pedido pronto para pagamento.</h2>
            <p className="mt-3 text-sm leading-6 text-[#69756f]">Na próxima etapa integraremos com InfinitePay usando a InfiniteTag <strong className="text-[#1F2933]">stefane-santos-518</strong>.</p>
            <div className="mt-5 rounded-2xl bg-[#f5f8f6] p-4"><span className="text-xs text-[#748079]">Total do pedido</span><strong className="mt-1 block text-2xl text-[#2F7D5C]">{formatCurrency(total)}</strong></div>
            <button type="button" onClick={() => setReady(false)} className="mt-5 w-full rounded-2xl bg-[#2F7D5C] py-3.5 text-sm font-bold text-white">Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
}

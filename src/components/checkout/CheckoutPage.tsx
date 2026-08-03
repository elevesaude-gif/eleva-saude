"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { formatCurrency } from "@/lib/currency";
import { digitalShippingOption, internalTestProduct, internalTestShippingOption, products, sellers } from "@/lib/mock-data";
import type { Category, CustomerData, SellerSlug, ShippingOption } from "@/types/checkout";
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

export function CheckoutPage({ seller, testMode, testToken }: { seller: SellerSlug; testMode: boolean; testToken?: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<Category>("Tirzepatida");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState(emptyCustomer);
  const [shippingId, setShippingId] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isShippingLoading, setIsShippingLoading] = useState(false);
  const [quotedPostalCode, setQuotedPostalCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const availableProducts = useMemo(() => testMode ? [...products, internalTestProduct] : products, [testMode]);

  const items = useMemo(() => availableProducts.filter((product) => quantities[product.id]).map((product) => ({ ...product, quantity: quantities[product.id] })), [availableProducts, quantities]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const filtered = useMemo(() => availableProducts.filter((product) => product.category === category), [availableProducts, category]);
  const setQuantity = (id: string, delta: number) => setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));
  const goToSummary = () => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const quoteItems = useMemo(() => items.map((item) => ({ id: item.id, quantity: item.quantity })), [items]);
  const hasShippableItems = items.some((item) => item.requiresShipping);
  const postalCode = customer.zipCode.replace(/\D/g, "");
  const validPostalCode = postalCode.length === 8;
  const noShippingOption = testMode && items.some((item) => item.id === internalTestProduct.id) ? internalTestShippingOption : digitalShippingOption;
  const effectiveShippingOptions = !hasShippableItems ? [noShippingOption] : validPostalCode && quotedPostalCode === postalCode ? shippingOptions : [];
  const effectiveShippingId = !hasShippableItems ? noShippingOption.id : shippingId;
  const shipping = effectiveShippingOptions.find((option) => option.id === effectiveShippingId);
  const shippingLoading = hasShippableItems && validPostalCode && (isShippingLoading || quotedPostalCode !== postalCode);
  const total = subtotal - discount + (shipping?.priceCents ?? 0) / 100;

  useEffect(() => {
    if (!items.length || !hasShippableItems || !validPostalCode) return;

    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setIsShippingLoading(true);
      setShippingOptions([]);
      setShippingId("");
      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postalCode: customer.zipCode, items: quoteItems, subtotalCents: Math.round(subtotal * 100), testToken }),
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (!response.ok || !isShippingResponse(body)) throw new Error("shipping_quote_failed");
        setShippingOptions(body.options);
        setShippingId(body.options[0]?.id ?? "");
        setQuotedPostalCode(postalCode);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setShippingOptions([]);
        setShippingId("");
      } finally {
        if (!controller.signal.aborted) setIsShippingLoading(false);
      }
    })();
    return () => controller.abort();
  }, [customer.zipCode, hasShippableItems, items, postalCode, quoteItems, subtotal, testMode, testToken, validPostalCode]);

  const finish = async () => {
    const form = document.getElementById("checkout-form") as HTMLFormElement | null;
    if (!form?.reportValidity() || isPaymentLoading || shippingLoading || !shipping) return;

    setIsPaymentLoading(true);
    setPaymentError("");
    try {
      const response = await fetch("/api/payments/infinitepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer,
          seller,
          shippingId: effectiveShippingId,
          shippingQuoteToken: shipping.quoteToken,
          couponCode: couponApplied ? couponCode : undefined,
          totalCents: Math.round(total * 100),
          testToken,
        }),
      });
      const responseText = await response.text();
      let data: unknown;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { ok: false, error: "non_json_response", message: responseText };
      }
      if (!response.ok || !isPaymentResponse(data)) {
        throw new Error("Pagamento indisponível.");
      }
      window.location.assign(data.paymentUrl);
    } catch {
      setPaymentError("Não foi possível iniciar o pagamento. Tente novamente ou fale com seu atendimento.");
      setIsPaymentLoading(false);
    }
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
                <h1 className="font-serif text-[29px] font-semibold leading-[1.08] tracking-[-.025em] sm:text-[38px]">Escolha sua tirzepatida</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Conheça as apresentações disponíveis para protocolos individualizados, sempre com prescrição e acompanhamento profissional.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C9C6F0] px-3 py-2 text-[11px] font-bold text-[#0D1B2A]">
                  <span aria-hidden>✓</span> Atendimento personalizado com {sellers[seller]}
                </div>
              </div>
            </section>
            <aside className="mb-6 flex flex-col gap-2 rounded-2xl border border-[#E6E8ED] bg-white px-4 py-3 text-sm text-[#344563] sm:flex-row sm:items-center sm:justify-between">
              <p>Em dúvida sobre tirzepatida, procedência ou orientação? <span className="font-semibold text-[#0D1B2A]">Leia o guia antes de escolher sua apresentação.</span></p>
              <Link href="/guia-canetas-emagrecimento" className="shrink-0 font-bold text-[#047857] underline decoration-[#A7F3D0] decoration-2 underline-offset-4 hover:text-[#065F46]">Ler guia</Link>
            </aside>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Recomendados no atendimento</p><h2 className="mt-1 text-2xl font-bold tracking-[-.03em] text-[#0D1B2A]">Itens disponíveis para seu pedido</h2></div>
              <span className="hidden text-xs text-[#344563] sm:block">{availableProducts.length} opções orientadas pela equipe</span>
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
                <ShippingOptions options={effectiveShippingOptions} selected={effectiveShippingId} onSelect={setShippingId} loading={shippingLoading} waitingForZip={hasShippableItems && !validPostalCode} />
                <CouponBox seller={seller} applied={couponApplied} onApply={(applied, code) => { setCouponApplied(applied); setCouponCode(code); }} />
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
                    <div className="flex justify-between"><span className="text-[#344563]">Frete</span><span className="font-semibold">{shipping ? formatCurrency(shipping.priceCents / 100) : "A calcular"}</span></div>
                    {shipping && <div className="rounded-xl bg-[#F7F8FA] p-3 text-xs text-[#344563]"><strong className="block text-[#0D1B2A]">{shipping.provider} · {shipping.service}</strong><span>{shipping.deliveryTime}</span></div>}
                  </div>
                  <div className="my-5 h-px bg-[#E6E8ED]" />
                  <div className="flex items-end justify-between"><div><span className="text-xs font-semibold text-[#344563]">Total a pagar</span><p className="text-[10px] text-[#344563]">em ambiente seguro</p></div><strong className="text-3xl tracking-[-.05em] text-[#0D1B2A]">{formatCurrency(total)}</strong></div>
                  <p className="mt-4 text-center text-[11px] leading-5 text-[#344563]">Você será direcionado para o ambiente seguro da InfinitePay.</p>
                  <button type="button" onClick={finish} disabled={isPaymentLoading || shippingLoading || !shipping} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#047857] px-4 py-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(4,120,87,.28)] transition hover:bg-[#065F46] disabled:cursor-wait disabled:opacity-75">
                    {isPaymentLoading ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Gerando pagamento seguro...</> : <>Finalizar no pagamento seguro <span>→</span></>}
                  </button>
                  {paymentError && <div role="alert" className="mt-3 rounded-xl border border-[#B42318]/20 bg-[#FEF3F2] px-3 py-2.5 text-xs leading-5 text-[#B42318]">{paymentError}</div>}
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
        <p className="mx-auto mt-6 max-w-7xl border-t border-[#E6E8ED] pt-4 text-center text-[10px] leading-4 text-[#344563]">Compra processada em ambiente seguro. Atendimento personalizado e acompanhamento do pedido pela equipe eLeve Saúde.</p>
      </footer>
    </div>
  );
}

function isShippingResponse(value: unknown): value is { ok: true; options: ShippingOption[] } {
  if (!value || typeof value !== "object" || !("ok" in value) || !("options" in value)) return false;
  const response = value as { ok?: unknown; options?: unknown };
  return response.ok === true && Array.isArray(response.options) && response.options.every((option) =>
    Boolean(option && typeof option.id === "string" && typeof option.provider === "string" && typeof option.service === "string" &&
      Number.isInteger(option.priceCents) && typeof option.deliveryTime === "string" &&
      ["melhor_envio", "fallback", "teste", "digital"].includes(option.source)));
}

function isPaymentResponse(value: unknown): value is { ok: true; orderId: string; orderNsu: string; paymentUrl: string } {
  return Boolean(
    value &&
    typeof value === "object" &&
    "ok" in value &&
    "orderId" in value &&
    "orderNsu" in value &&
    "paymentUrl" in value &&
    value.ok === true &&
    typeof value.orderId === "string" &&
    typeof value.orderNsu === "string" &&
    typeof value.paymentUrl === "string" &&
    value.paymentUrl.startsWith("https://checkout.infinitepay.io/")
  );
}

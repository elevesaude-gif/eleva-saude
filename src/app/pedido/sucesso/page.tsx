import { BrandLogo } from "@/components/brand/BrandLogo";
import { findOrderByNsu } from "@/lib/orders";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SuccessSearchParams = {
  receipt_url?: string | string[];
  order_nsu?: string | string[];
  slug?: string | string[];
  capture_method?: string | string[];
  transaction_nsu?: string | string[];
};

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<SuccessSearchParams> }) {
  const params = await searchParams;
  const orderNsu = firstValue(params.order_nsu);
  const slug = firstValue(params.slug);
  const captureMethod = firstValue(params.capture_method);
  const transactionNsu = firstValue(params.transaction_nsu);
  const receiptUrl = safeReceiptUrl(firstValue(params.receipt_url));
  const order = orderNsu ? await findOrderByNsu(orderNsu).catch(() => null) : null;
  const displayedReceiptUrl = receiptUrl || safeReceiptUrl(order?.receipt_url || undefined);
  const isPaid = order?.payment_status === "paid";

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-4 py-10 text-[#0D1B2A]">
      <section className="w-full max-w-xl overflow-hidden rounded-[30px] border border-[#E6E8ED] bg-white shadow-[0_22px_70px_rgba(13,27,42,.1)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#344563] to-[#0D1B2A] px-6 pb-8 pt-7 text-white sm:px-9">
          <span className="absolute -right-12 -top-14 size-40 rounded-full border-[28px] border-[#C9C6F0]/10" />
          <BrandLogo negative size="small" className="mb-4" />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#047857]">
            <span aria-hidden>✓</span> Retorno do pagamento
          </span>
          <h1 className="relative mt-4 font-serif text-3xl font-semibold tracking-[-.03em]">Estamos confirmando seu pagamento</h1>
          <p className="relative mt-3 max-w-md text-sm leading-6 text-white/75">Se o pagamento foi concluído, nossa equipe seguirá com o acompanhamento do pedido.</p>
        </div>

        <div className="p-6 sm:p-9">
          <div className={`mb-5 rounded-2xl border px-4 py-3 ${isPaid ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" : "border-[#C9C6F0] bg-[#C9C6F0]/25 text-[#344563]"}`}>
            <p className="text-[9px] font-bold uppercase tracking-[.14em]">Status do pedido</p>
            <p className="mt-1 text-sm font-bold">{isPaid ? "Pagamento confirmado" : "Pagamento em confirmação"}</p>
          </div>

          {orderNsu && <div className="rounded-2xl border border-[#E6E8ED] bg-[#F7F8FA] p-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#344563]">Número do pedido</p><p className="mt-1 break-all font-mono text-sm font-bold">{orderNsu}</p></div>}

          {(captureMethod || transactionNsu || slug) && (
            <dl className="mt-4 grid gap-3 rounded-2xl border border-[#E6E8ED] p-4 text-xs sm:grid-cols-2">
              {captureMethod && <Detail label="Forma de pagamento" value={formatCaptureMethod(captureMethod)} />}
              {transactionNsu && <Detail label="Transação" value={transactionNsu} />}
              {slug && <Detail label="Referência InfinitePay" value={slug} />}
            </dl>
          )}

          {displayedReceiptUrl && <a href={displayedReceiptUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#047857] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(4,120,87,.2)] transition hover:bg-[#065F46]">Ver comprovante <span aria-hidden>↗</span></a>}

          <div className="mt-5 rounded-2xl border border-[#C9C6F0] bg-[#C9C6F0]/25 p-4 text-xs leading-5 text-[#344563]">A confirmação pode levar alguns instantes. Você pode retornar a esta página para consultar novamente o status do pedido.</div>
          <Link href="/rastreio" className="mt-4 flex w-full items-center justify-center rounded-2xl border border-[#047857] px-5 py-3.5 text-sm font-bold text-[#047857] transition hover:bg-[#ECFDF5]">Rastrear meu pedido</Link>
          <p className="mt-6 text-center text-[11px] text-[#344563]">eLeve Saúde · Um caminho mais leve para a sua saúde</p>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="font-semibold text-[#344563]">{label}</dt><dd className="mt-1 break-all font-bold">{value}</dd></div>; }
function firstValue(value?: string | string[]) { return Array.isArray(value) ? value[0] : value; }
function safeReceiptUrl(value?: string) { if (!value) return undefined; try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; } }
function formatCaptureMethod(value: string) { if (value === "credit_card") return "Cartão de crédito"; if (value === "pix") return "Pix"; return value; }

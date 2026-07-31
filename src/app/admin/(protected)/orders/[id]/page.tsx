import { updateFulfillmentStatus } from "@/app/admin/actions";
import { formatCurrency } from "@/lib/currency";
import { fulfillmentStatuses, getAdminOrder } from "@/lib/admin/orders";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminOrder(id);
  if (!detail) notFound();
  const { order, items, events } = detail;
  const updateAction = updateFulfillmentStatus;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="inline-flex rounded-xl px-2 py-2 text-sm font-bold text-[#344563] hover:bg-[#C9C6F0]/30">← Voltar aos pedidos</Link>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Detalhe do pedido</p><h1 className="mt-1 break-all font-mono text-xl font-bold sm:text-2xl">{order.order_nsu}</h1></div>
        <div className="flex gap-2"><Badge value={order.payment_status} /><Badge value={order.fulfillment_status} /></div>
      </div>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card title="Cliente e entrega">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Cliente" value={order.customer_name} />
              <Detail label="CPF" value={order.customer_cpf} />
              <Detail label="Telefone" value={order.customer_phone} />
              <Detail label="E-mail" value={order.customer_email} />
              <Detail label="Vendedor" value={`${order.seller_name} (${order.seller_slug})`} />
              <Detail label="Endereço" value={`${order.street}, ${order.address_number}${order.complement ? `, ${order.complement}` : ""} — ${order.neighborhood}, ${order.city}/${order.state} — CEP ${order.postal_code}${order.reference ? ` — Ref.: ${order.reference}` : ""}`} />
            </dl>
          </Card>

          <Card title="Itens comprados">
            <div className="divide-y divide-[#E6E8ED]">
              {items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-bold">{item.product_name}</p><p className="mt-1 text-xs text-[#344563]">{item.quantity} × {formatCurrency(item.unit_price_cents / 100)} · {item.product_id}</p></div><strong className="text-sm">{formatCurrency(item.total_price_cents / 100)}</strong></div>)}
            </div>
          </Card>

          <Card title="Eventos de pagamento">
            <div className="space-y-3">
              {events.map((event) => <div key={event.id} className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] p-3 text-xs"><div className="flex justify-between gap-3"><strong>{event.event_type}</strong><span className="text-[#344563]">{formatDate(event.created_at)}</span></div><p className="mt-1 break-all text-[#344563]">{event.provider}{event.transaction_nsu ? ` · ${event.transaction_nsu}` : ""}</p></div>)}
              {!events.length && <p className="text-sm text-[#344563]">Nenhum evento registrado.</p>}
            </div>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <Card title="Resumo financeiro">
            <dl className="space-y-3 text-sm">
              <Money label="Subtotal" cents={order.subtotal_cents} />
              <Money label="Desconto" cents={-order.discount_cents} />
              <Money label="Frete" cents={order.shipping_cents} />
              <div className="border-t border-[#E6E8ED] pt-3"><Money label="Total" cents={order.total_cents} strong /></div>
            </dl>
            <div className="mt-4 rounded-xl bg-[#F7F8FA] p-3 text-xs text-[#344563]"><strong className="block text-[#0D1B2A]">{order.shipping_service}</strong><span>{order.shipping_company ?? order.shipping_id}{order.shipping_deadline ? ` · ${order.shipping_deadline}` : ""}</span></div>
          </Card>

          <Card title="Status operacional">
            <form action={updateAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" defaultValue={fulfillmentStatuses.includes(order.fulfillment_status as typeof fulfillmentStatuses[number]) ? order.fulfillment_status : ""} required className="w-full rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-3 text-sm">
                {!fulfillmentStatuses.includes(order.fulfillment_status as typeof fulfillmentStatuses[number]) && <option value="" disabled>Status atual: {order.fulfillment_status}</option>}
                {fulfillmentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
              <button className="w-full rounded-xl bg-[#0D1B2A] px-4 py-3 text-sm font-bold text-white hover:bg-[#344563]">Atualizar andamento</button>
            </form>
            <p className="mt-3 text-[11px] leading-5 text-[#344563]">O status de pagamento é atualizado somente pela integração InfinitePay.</p>
          </Card>

          <Card title="Pagamento e datas">
            <dl className="space-y-3 text-xs">
              <Detail label="Pagamento" value={order.payment_status} />
              <Detail label="Transação" value={order.transaction_nsu ?? "—"} />
              <Detail label="Método" value={order.capture_method ?? "—"} />
              <Detail label="Criado em" value={formatDate(order.created_at)} />
              <Detail label="Pago em" value={order.paid_at ? formatDate(order.paid_at) : "—"} />
            </dl>
            <div className="mt-4 grid gap-2">
              {safeHttpsUrl(order.receipt_url) && <a href={safeHttpsUrl(order.receipt_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#C9C6F0] px-3 py-2 text-center text-xs font-bold hover:bg-[#C9C6F0]/30">Abrir comprovante ↗</a>}
              {safeHttpsUrl(order.payment_url) && <a href={safeHttpsUrl(order.payment_url)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#E6E8ED] px-3 py-2 text-center text-xs font-bold hover:bg-[#F7F8FA]">Abrir link de pagamento ↗</a>}
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[24px] border border-[#E6E8ED] bg-white p-5 shadow-[0_12px_40px_rgba(13,27,42,.055)]"><h2 className="mb-4 text-base font-extrabold">{title}</h2>{children}</section>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-[.1em] text-[#344563]">{label}</dt><dd className="mt-1 break-words font-semibold text-[#0D1B2A]">{value}</dd></div>; }
function Money({ label, cents, strong }: { label: string; cents: number; strong?: boolean }) { return <div className="flex justify-between gap-4"><dt className="text-[#344563]">{label}</dt><dd className={strong ? "text-lg font-bold text-[#0D1B2A]" : "font-semibold"}>{formatCurrency(cents / 100)}</dd></div>; }
function Badge({ value }: { value: string }) { return <span className="rounded-full bg-[#C9C6F0]/40 px-3 py-1.5 text-[10px] font-bold">{statusLabel(value)}</span>; }
function statusLabel(status: string) { return ({ pending: "Pendente", paid: "Pago", awaiting_payment: "Aguardando pagamento", paid_not_fulfilled: "Pago / a preparar", in_preparation: "Em preparação", shipped: "Enviado", completed: "Concluído", canceled: "Cancelado" } as Record<string, string>)[status] ?? status; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)); }
function safeHttpsUrl(value: string | null) { if (!value) return undefined; try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; } }

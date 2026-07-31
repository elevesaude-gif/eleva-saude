import { formatCurrency } from "@/lib/currency";
import { getAdminDashboard, type AdminFilter } from "@/lib/admin/orders";
import Link from "next/link";

const filters: Array<{ value: AdminFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagos" },
  { value: "completed", label: "Concluídos" },
  { value: "canceled", label: "Cancelados" },
];

type SearchParams = { status?: string | string[]; q?: string | string[] };

export default async function AdminPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const statusValue = firstValue(query.status);
  const filter = filters.some((item) => item.value === statusValue) ? statusValue as AdminFilter : "all";
  const search = firstValue(query.q)?.trim() ?? "";
  const { metrics, orders } = await getAdminDashboard(filter, search);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Operação eLeve Saúde</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-[-.03em] sm:text-4xl">Pedidos</h1></div>
        <p className="text-xs text-[#344563]">Exibindo até 200 pedidos recentes</p>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pedidos hoje" value={String(metrics.ordersToday)} />
        <MetricCard label="Pagos hoje" value={String(metrics.paidToday)} tone="green" />
        <MetricCard label="Receita paga hoje" value={formatCurrency(metrics.paidRevenueTodayCents / 100)} />
        <MetricCard label="Pendentes" value={String(metrics.pending)} tone="lavender" />
      </section>

      <section className="mt-6 rounded-[24px] border border-[#E6E8ED] bg-white p-4 shadow-[0_12px_40px_rgba(13,27,42,.055)] sm:p-5">
        <form className="flex flex-col gap-3 md:flex-row" action="/admin">
          <input type="hidden" name="status" value={filter} />
          <input name="q" defaultValue={search} placeholder="Buscar pedido, cliente, telefone ou e-mail" className="min-w-0 flex-1 rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3 text-sm" />
          <button className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-bold text-white hover:bg-[#344563]">Buscar</button>
        </form>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtros de pedido">
          {filters.map((item) => {
            const href = `/admin?status=${item.value}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
            return <Link key={item.value} href={href} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${filter === item.value ? "bg-[#C9C6F0] text-[#0D1B2A]" : "bg-[#F7F8FA] text-[#344563] hover:bg-[#E6E8ED]"}`}>{item.label}</Link>;
          })}
        </nav>
      </section>

      <section className="mt-6 overflow-hidden rounded-[24px] border border-[#E6E8ED] bg-white shadow-[0_12px_40px_rgba(13,27,42,.055)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
            <thead className="bg-[#0D1B2A] text-white"><tr>{["Data", "Pedido", "Vendedor", "Cliente", "Telefone", "Total", "Pagamento", "Operação", "Pago em", ""].map((label) => <th key={label} className="px-4 py-3 font-bold">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#E6E8ED]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F7F8FA]">
                  <td className="whitespace-nowrap px-4 py-3 text-[#344563]">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-mono font-bold">{order.order_nsu}</td>
                  <td className="px-4 py-3">{order.seller_name}</td>
                  <td className="max-w-48 truncate px-4 py-3 font-semibold">{order.customer_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{order.customer_phone}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold">{formatCurrency(order.total_cents / 100)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.payment_status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={order.fulfillment_status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#344563]">{order.paid_at ? formatDate(order.paid_at) : "—"}</td>
                  <td className="px-4 py-3"><Link href={`/admin/orders/${order.id}`} className="rounded-lg border border-[#C9C6F0] px-3 py-2 font-bold hover:bg-[#C9C6F0]/30">Ver detalhes</Link></td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-[#344563]">Nenhum pedido encontrado para os filtros atuais.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "green" | "lavender" }) {
  const style = tone === "green" ? "border-[#A7F3D0] bg-[#ECFDF5]" : tone === "lavender" ? "border-[#C9C6F0] bg-[#C9C6F0]/25" : "border-[#E6E8ED] bg-white";
  return <div className={`rounded-[22px] border p-5 ${style}`}><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#344563]">{label}</p><p className="mt-2 text-3xl font-bold tracking-[-.04em]">{value}</p></div>;
}

function StatusBadge({ status }: { status: string }) {
  const positive = status === "paid" || status === "completed";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${positive ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#F1F2F5] text-[#344563]"}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: string) {
  return ({ pending: "Pendente", paid: "Pago", awaiting_payment: "Aguardando pagamento", paid_not_fulfilled: "Pago / a preparar", in_preparation: "Em preparação", shipped: "Enviado", completed: "Concluído", canceled: "Cancelado" } as Record<string, string>)[status] ?? status;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)); }
function firstValue(value?: string | string[]) { return Array.isArray(value) ? value[0] : value; }

import { formatCurrency } from "@/lib/currency";
import type { ShippingOption } from "@/types/checkout";

type Props = { options: ShippingOption[]; selected: string; onSelect: (id: string) => void; loading?: boolean; waitingForZip?: boolean };

export function ShippingOptions({ options, selected, onSelect, loading, waitingForZip }: Props) {
  return (
    <section className="checkout-card">
      <div className="section-heading">
        <span className="section-icon">↗</span>
        <div><p className="section-kicker">Forma de entrega</p><h2 className="section-title">Como deseja receber?</h2><p className="section-description">Escolha a opção que combina com seu momento.</p></div>
      </div>
      {loading && <div role="status" className="flex items-center gap-2 rounded-2xl bg-[#F7F8FA] p-4 text-sm font-semibold text-[#344563]"><span className="size-4 animate-spin rounded-full border-2 border-[#C9C6F0] border-t-[#0D1B2A]" /> Calculando as melhores opções de frete...</div>}
      {!loading && waitingForZip && <p className="rounded-2xl bg-[#F7F8FA] p-4 text-sm text-[#344563]">Informe um CEP válido para calcular o frete.</p>}
      {!loading && !waitingForZip && options.length === 0 && <p role="alert" className="rounded-2xl border border-[#C9C6F0] bg-[#F7F8FA] p-4 text-sm leading-6 text-[#344563]">Não encontramos entrega automática para este CEP. Fale com seu atendimento para concluir o pedido.</p>}
      {!loading && !waitingForZip && options.length > 0 && <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const active = selected === option.id;
          return (
            <label key={option.id} className={`relative flex min-h-40 cursor-pointer flex-col rounded-[20px] border p-4 transition ${active ? "border-[#0D1B2A] bg-[#C9C6F0]/35 shadow-[0_8px_25px_rgba(13,27,42,.08)] ring-2 ring-[#C9C6F0]" : "border-[#E6E8ED] bg-[#F7F8FA] hover:border-[#C9C6F0]"}`}>
              {options[0]?.id === option.id && options.length > 1 && <span className="absolute right-3 top-3 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#047857]">Recomendado</span>}
              <input type="radio" name="shipping" value={option.id} checked={active} onChange={() => onSelect(option.id)} className="sr-only" />
              <span className={`grid size-5 place-items-center rounded-full border text-[10px] ${active ? "border-[#047857] bg-[#047857] text-white" : "border-[#E6E8ED] bg-white"}`}>{active ? "✓" : ""}</span>
              <strong className="mt-5 pr-10 text-sm leading-5 text-[#0D1B2A]">{option.provider} · {option.service}</strong>
              <span className="mt-2 text-xs text-[#344563]">{option.deliveryTime}</span>
              {option.description && <span className="mt-1 text-[11px] leading-4 text-[#344563]">{option.description}</span>}
              <strong className="mt-auto pt-3 text-base text-[#0D1B2A]">{formatCurrency(option.priceCents / 100)}</strong>
            </label>
          );
        })}
      </div>}
    </section>
  );
}

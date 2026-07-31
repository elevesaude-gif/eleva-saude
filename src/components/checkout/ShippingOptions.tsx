import { formatCurrency } from "@/lib/currency";
import { shippingOptions } from "@/lib/mock-data";

type Props = { selected: string; onSelect: (id: string) => void };

export function ShippingOptions({ selected, onSelect }: Props) {
  return (
    <section className="checkout-card">
      <div className="section-heading">
        <span className="section-icon">↗</span>
        <div><p className="section-kicker">Forma de entrega</p><h2 className="section-title">Como deseja receber?</h2><p className="section-description">Escolha a opção que combina com seu momento.</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {shippingOptions.map((option) => {
          const active = selected === option.id;
          return (
            <label key={option.id} className={`relative flex min-h-40 cursor-pointer flex-col rounded-[20px] border p-4 transition ${active ? "border-[#0D1B2A] bg-[#C9C6F0]/35 shadow-[0_8px_25px_rgba(13,27,42,.08)] ring-2 ring-[#C9C6F0]" : "border-[#E6E8ED] bg-[#F7F8FA] hover:border-[#C9C6F0]"}`}>
              {option.id === "jadlog" && <span className="absolute right-3 top-3 rounded-full bg-[#C9C6F0]/60 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[#0D1B2A]">Recomendado</span>}
              <input type="radio" name="shipping" value={option.id} checked={active} onChange={() => onSelect(option.id)} className="sr-only" />
              <span className={`grid size-5 place-items-center rounded-full border text-[10px] ${active ? "border-[#0D1B2A] bg-[#0D1B2A] text-white" : "border-[#E6E8ED] bg-white"}`}>{active ? "✓" : ""}</span>
              <strong className="mt-5 pr-10 text-sm leading-5 text-[#0D1B2A]">{option.name}</strong>
              <span className="mt-2 text-xs text-[#344563]">{option.estimate}</span>
              <strong className="mt-auto pt-3 text-base text-[#0D1B2A]">{formatCurrency(option.price)}</strong>
            </label>
          );
        })}
      </div>
    </section>
  );
}

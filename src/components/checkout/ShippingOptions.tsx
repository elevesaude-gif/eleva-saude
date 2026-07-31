import { formatCurrency } from "@/lib/currency";
import { shippingOptions } from "@/lib/mock-data";

type Props = { selected: string; onSelect: (id: string) => void };

export function ShippingOptions({ selected, onSelect }: Props) {
  return (
    <section className="rounded-3xl border border-[#dfe8e3] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#fff5dc] text-[#a8761d]">⇢</span>
        <div><h2 className="font-bold text-[#1F2933]">Escolha o frete</h2><p className="text-xs text-[#748079]">Valores e prazos simulados</p></div>
      </div>
      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const active = selected === option.id;
          return (
            <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${active ? "border-[#2F7D5C] bg-[#f4faf7] ring-1 ring-[#2F7D5C]" : "border-[#dfe6e2] hover:border-[#9bb9aa]"}`}>
              <input type="radio" name="shipping" value={option.id} checked={active} onChange={() => onSelect(option.id)} className="size-4 accent-[#2F7D5C]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#1F2933]">{option.name}</span>
                <span className="text-xs text-[#748079]">{option.estimate}</span>
              </span>
              <strong className="text-sm text-[#2F7D5C]">{formatCurrency(option.price)}</strong>
            </label>
          );
        })}
      </div>
    </section>
  );
}

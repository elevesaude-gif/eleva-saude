import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types/checkout";

type Props = { product: Product; quantity: number; onAdd: () => void; onRemove: () => void };

export function ProductCard({ product, quantity, onAdd, onRemove }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e0e8e3] bg-white p-3 shadow-[0_10px_35px_rgba(31,41,51,.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(31,41,51,.09)]">
      <div className="grid h-32 place-items-center rounded-[20px] text-5xl text-[#2F7D5C]" style={{ backgroundColor: product.accent }}>
        <span className="grid size-20 place-items-center rounded-full border border-white/70 bg-white/45">{product.icon}</span>
      </div>
      <div className="flex flex-1 flex-col p-2 pt-4">
        <span className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#2F7D5C]">{product.category}</span>
        <h3 className="text-base font-bold text-[#1F2933]">{product.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-5 text-[#69756f]">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <strong className="text-lg text-[#1F2933]">{formatCurrency(product.price)}</strong>
          {quantity === 0 ? (
            <button type="button" onClick={onAdd} aria-label={`Adicionar ${product.name}`}
              className="grid size-10 place-items-center rounded-xl bg-[#2F7D5C] text-xl font-medium text-white transition hover:bg-[#25694c]">+</button>
          ) : (
            <div className="flex items-center rounded-xl border border-[#d7e1db] bg-[#f8faf9] p-1">
              <button type="button" onClick={onRemove} className="grid size-8 place-items-center rounded-lg text-lg text-[#2F7D5C] hover:bg-white">−</button>
              <span className="w-7 text-center text-sm font-bold">{quantity}</span>
              <button type="button" onClick={onAdd} className="grid size-8 place-items-center rounded-lg text-lg text-[#2F7D5C] hover:bg-white">+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

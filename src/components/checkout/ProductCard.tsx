import { formatCurrency } from "@/lib/currency";
import type { Product } from "@/types/checkout";
import Image from "next/image";

type Props = { product: Product; quantity: number; onAdd: () => void; onRemove: () => void };

export function ProductCard({ product, quantity, onAdd, onRemove }: Props) {
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-white p-3 shadow-[0_12px_40px_rgba(13,27,42,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(13,27,42,.1)] ${quantity ? "border-[#0D1B2A] ring-2 ring-[#C9C6F0]" : "border-[#E6E8ED]"}`}>
      {quantity > 0 && <span className="absolute right-5 top-5 z-10 rounded-full bg-[#0D1B2A] px-2.5 py-1 text-[10px] font-bold text-white shadow-md">{quantity} no pedido</span>}
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-[20px] bg-[#FAFAF7] text-4xl text-[#0D1B2A]">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-contain p-4 sm:p-5" />
        ) : (
          <>
            <span className="absolute -right-7 -top-8 size-24 rounded-full border-[18px] border-[#C9C6F0]/60" />
            <span className="absolute -bottom-12 -left-8 size-28 rounded-full bg-[#E6E8ED]" />
            <span className="relative grid size-20 place-items-center rounded-[24px] border border-[#E6E8ED] shadow-[0_10px_25px_rgba(13,27,42,.08)]" style={{ backgroundColor: product.accent }}>{product.icon}</span>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <span className="mb-2 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#344563]">{product.category}</span>
        <h3 className="min-h-11 text-[17px] font-bold leading-tight tracking-[-.01em] text-[#0D1B2A]">{product.name}</h3>
        <p className="mt-2 flex-1 text-[13px] leading-5 text-[#344563]">{product.description}</p>
        <div className="mt-5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#344563]">Investimento</span>
          <strong className="block text-2xl font-extrabold tracking-[-.04em] text-[#16A34A]">{formatCurrency(product.price)}</strong>
        </div>
        {quantity === 0 ? (
          <button type="button" onClick={onAdd} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#047857] py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(4,120,87,.16)] transition hover:bg-[#065F46]">
            <span className="text-lg leading-none">+</span> Adicionar ao pedido
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#C9C6F0] p-1.5">
            <button type="button" onClick={onRemove} aria-label={`Remover uma unidade de ${product.name}`} className="grid size-9 place-items-center rounded-lg bg-white text-lg text-[#0D1B2A] shadow-sm">−</button>
            <span className="text-center text-sm font-bold text-[#0D1B2A]"><span className="block text-[9px] font-semibold uppercase opacity-70">Quantidade</span>{quantity}</span>
            <button type="button" onClick={onAdd} aria-label={`Adicionar mais uma unidade de ${product.name}`} className="grid size-9 place-items-center rounded-lg bg-[#0D1B2A] text-lg text-white shadow-sm">+</button>
          </div>
        )}
      </div>
    </article>
  );
}

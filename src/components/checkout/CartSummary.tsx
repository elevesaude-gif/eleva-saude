import { formatCurrency } from "@/lib/currency";
import type { CartItem } from "@/types/checkout";

type Props = {
  items: CartItem[];
  subtotal: number;
  onContinue?: () => void;
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export function CartSummary({ items, subtotal, onContinue, onAdd, onRemove }: Props) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <aside className="rounded-3xl border border-[#dfe8e3] bg-white p-5 shadow-[0_14px_45px_rgba(31,41,51,.07)] lg:sticky lg:top-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F2933]">Seu carrinho</h2>
        <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-xs font-bold text-[#2F7D5C]">{count} {count === 1 ? "item" : "itens"}</span>
      </div>
      {items.length === 0 ? (
        <div className="py-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF5EF] text-2xl">♡</span>
          <p className="mt-4 font-semibold text-[#435048]">Seu carrinho está leve</p>
          <p className="mt-1 text-sm text-[#7a857f]">Escolha um cuidado para começar.</p>
        </div>
      ) : (
        <div className="my-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl text-xl text-[#2F7D5C]" style={{ background: item.accent }}>{item.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-[#748079]">{formatCurrency(item.price)}</p>
              </div>
              {onAdd && onRemove && (
                <div className="flex h-8 items-center rounded-lg border border-[#dde5e1]">
                  <button type="button" onClick={() => onRemove(item.id)} className="size-7 text-[#2F7D5C]">−</button>
                  <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                  <button type="button" onClick={() => onAdd(item.id)} className="size-7 text-[#2F7D5C]">+</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-[#e6ece8] pt-4">
        <span className="text-sm text-[#69756f]">Subtotal</span>
        <strong className="text-xl text-[#1F2933]">{formatCurrency(subtotal)}</strong>
      </div>
      {onContinue && (
        <button type="button" disabled={!items.length} onClick={onContinue}
          className="mt-5 w-full rounded-2xl bg-[#2F7D5C] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(47,125,92,.22)] transition hover:bg-[#276d50] disabled:cursor-not-allowed disabled:bg-[#aebbb4] disabled:shadow-none">
          Continuar para resumo <span aria-hidden>→</span>
        </button>
      )}
      <p className="mt-3 text-center text-[11px] text-[#87918c]">Você poderá revisar tudo antes de pagar</p>
    </aside>
  );
}

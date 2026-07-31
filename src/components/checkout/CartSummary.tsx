import { formatCurrency } from "@/lib/currency";
import type { CartItem } from "@/types/checkout";

type Props = {
  items: CartItem[];
  subtotal: number;
  sellerName: string;
  onContinue: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
};

export function CartSummary({ items, subtotal, sellerName, onContinue, onAdd, onRemove }: Props) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <aside className="hidden rounded-[28px] border border-[#E6E8ED] bg-white p-5 shadow-[0_18px_55px_rgba(13,27,42,.08)] lg:sticky lg:top-28 lg:block">
      <div className="flex items-center justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#344563]">Acompanhado por {sellerName}</p><h2 className="mt-1 text-xl font-bold tracking-[-.02em] text-[#0D1B2A]">Seu pedido</h2></div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#C9C6F0] text-sm font-extrabold text-[#0D1B2A]">{count}</span>
      </div>
      {items.length === 0 ? (
        <div className="py-11 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-[#F7F8FA] text-2xl text-[#0D1B2A]">♡</span>
          <p className="mt-4 font-bold text-[#0D1B2A]">Seu pedido está vazio</p>
          <p className="mx-auto mt-1 max-w-48 text-xs leading-5 text-[#344563]">Adicione o item combinado no atendimento.</p>
        </div>
      ) : (
        <div className="my-5 max-h-[390px] space-y-3 overflow-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#F7F8FA] p-2.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl text-lg text-[#0D1B2A]" style={{ background: item.accent }}>{item.icon}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#0D1B2A]">{item.name}</p><p className="mt-0.5 text-[11px] font-semibold text-[#344563]">{formatCurrency(item.price * item.quantity)}</p></div>
              <div className="flex h-8 items-center rounded-lg border border-[#E6E8ED] bg-white">
                <button type="button" aria-label="Remover unidade" onClick={() => onRemove(item.id)} className="size-7 text-[#0D1B2A]">−</button>
                <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                <button type="button" aria-label="Adicionar unidade" onClick={() => onAdd(item.id)} className="size-7 text-[#0D1B2A]">+</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2 border-t border-[#E6E8ED] pt-5 text-xs">
        <div className="flex justify-between"><span className="text-[#344563]">Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="flex justify-between"><span className="text-[#344563]">Desconto</span><span className="text-[#344563]">Na próxima etapa</span></div>
        <div className="flex justify-between"><span className="text-[#344563]">Frete</span><span className="text-[#344563]">Na próxima etapa</span></div>
        <div className="flex items-end justify-between border-t border-[#E6E8ED] pt-3"><span className="font-bold text-[#0D1B2A]">Total parcial</span><strong className="text-2xl tracking-[-.04em] text-[#0D1B2A]">{formatCurrency(subtotal)}</strong></div>
      </div>
      <button type="button" disabled={!items.length} onClick={onContinue} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D1B2A] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(13,27,42,.22)] transition hover:bg-[#344563] hover:ring-4 hover:ring-[#C9C6F0] disabled:bg-[#E6E8ED] disabled:text-[#344563] disabled:shadow-none">
        {items.length ? <><span>Continuar</span><span aria-hidden>→</span></> : "Adicione um item para continuar"}
      </button>
      <p className="mt-3 rounded-full bg-[#C9C6F0] px-3 py-2 text-center text-[10px] font-semibold text-[#0D1B2A]">✓ Pagamento seguro · Você revisará tudo antes</p>
    </aside>
  );
}

export function MobileCartBar({ items, subtotal, onContinue }: Pick<Props, "items" | "subtotal" | "onContinue">) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6E8ED] bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(13,27,42,.1)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-[#344563]">{count} {count === 1 ? "item" : "itens"}</p><p className="truncate text-lg font-extrabold tracking-[-.03em] text-[#0D1B2A]">{formatCurrency(subtotal)}</p></div>
        <button type="button" disabled={!items.length} onClick={onContinue} className="rounded-2xl bg-[#0D1B2A] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(13,27,42,.2)] hover:bg-[#344563] disabled:bg-[#E6E8ED] disabled:text-[#344563]">Continuar <span aria-hidden>→</span></button>
      </div>
    </div>
  );
}

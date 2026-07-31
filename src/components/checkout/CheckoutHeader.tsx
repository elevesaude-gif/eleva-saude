import { BrandLogo } from "@/components/brand/BrandLogo";

type Props = { sellerName: string };

export function CheckoutHeader({ sellerName }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E8ED] bg-white/95 shadow-[0_8px_30px_rgba(13,27,42,.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <BrandLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-[#C9C6F0] px-3 py-2 text-xs font-bold text-[#0D1B2A] sm:flex">
            <span aria-hidden>✓</span> Pagamento seguro
          </div>
          <div className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-2 text-right sm:rounded-2xl sm:px-4">
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#344563]">Pedido acompanhado por</p>
            <p className="text-sm font-bold leading-tight text-[#0D1B2A]">{sellerName}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[#E6E8ED] bg-[#F7F8FA] px-4 py-2 text-center text-[10px] font-medium text-[#344563] sm:hidden">
        Escolha o item combinado no atendimento e finalize com segurança.
      </div>
    </header>
  );
}

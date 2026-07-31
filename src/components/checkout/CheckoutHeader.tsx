type Props = { sellerName: string };

export function CheckoutHeader({ sellerName }: Props) {
  return (
    <header className="border-b border-[#dfe9e3] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#2F7D5C] text-xl font-semibold text-white">E</div>
          <div>
            <p className="font-serif text-xl font-semibold leading-none text-[#1F2933]">Eleva Saúde</p>
            <p className="mt-1 hidden text-[11px] text-[#66736d] sm:block">Cuidado que acompanha você</p>
          </div>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5EF] px-3 py-1.5 text-xs font-semibold text-[#2F7D5C]">
            <span aria-hidden>⌾</span> Pagamento seguro
          </p>
          <p className="mt-1.5 text-xs text-[#66736d]">Atendimento com: <strong className="text-[#1F2933]">{sellerName}</strong></p>
        </div>
      </div>
    </header>
  );
}

type Props = { step: 1 | 2 };

export function Stepper({ step }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto flex max-w-md items-center rounded-2xl border border-[#E6E8ED] bg-white p-1.5 shadow-[0_8px_30px_rgba(13,27,42,.05)]" aria-label={`Etapa ${step} de 2`}>
        {(["Pedido", "Dados e pagamento"] as const).map((label, index) => {
          const number = (index + 1) as 1 | 2;
          const active = number === step;
          const completed = number < step;
          return (
            <div key={label} className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 transition sm:px-5 ${active ? "bg-[#C9C6F0] text-[#0D1B2A]" : completed ? "text-[#0D1B2A]" : "bg-[#F7F8FA] text-[#344563]"}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${active || completed ? "bg-[#0D1B2A] text-white" : "border border-[#E6E8ED] bg-white"}`}>{completed ? "✓" : number}</span>
              <span className="min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-wider opacity-70">Etapa {number}</span>
                <span className="block truncate text-[11px] font-bold sm:text-sm">{label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

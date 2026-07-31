type Props = { step: 1 | 2 };

export function Stepper({ step }: Props) {
  return (
    <div className="mx-auto flex max-w-sm items-center px-4 py-7" aria-label={`Etapa ${step} de 2`}>
      {(["Produto", "Resumo"] as const).map((label, index) => {
        const number = (index + 1) as 1 | 2;
        const active = number <= step;
        return (
          <div className="contents" key={label}>
            <div className="flex flex-col items-center gap-2">
              <span className={`grid size-9 place-items-center rounded-full text-sm font-bold transition ${active ? "bg-[#2F7D5C] text-white shadow-[0_4px_14px_rgba(47,125,92,.25)]" : "border border-[#cfd9d3] bg-white text-[#85918b]"}`}>
                {number < step ? "✓" : number}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-[#2F7D5C]" : "text-[#85918b]"}`}>{label}</span>
            </div>
            {index === 0 && <span className={`mb-6 h-px flex-1 ${step === 2 ? "bg-[#2F7D5C]" : "bg-[#d9e2dd]"}`} />}
          </div>
        );
      })}
    </div>
  );
}

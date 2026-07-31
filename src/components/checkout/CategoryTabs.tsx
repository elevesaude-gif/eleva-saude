import { categories } from "@/lib/mock-data";
import type { Category } from "@/types/checkout";

type Props = { active: "Todos" | Category; onChange: (category: "Todos" | Category) => void };

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <button key={category} type="button" onClick={() => onChange(category)}
          className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-bold transition sm:rounded-2xl sm:px-5 sm:text-sm ${active === category ? "border-[#0D1B2A] bg-[#0D1B2A] text-white shadow-[0_6px_18px_rgba(13,27,42,.18)]" : "border-[#E6E8ED] bg-[#F7F8FA] text-[#344563] hover:border-[#C9C6F0] hover:bg-[#C9C6F0]"}`}>
          {category}
        </button>
      ))}
    </div>
  );
}

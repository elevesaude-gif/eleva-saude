import { categories } from "@/lib/mock-data";
import type { Category } from "@/types/checkout";

type Props = { active: "Todos" | Category; onChange: (category: "Todos" | Category) => void };

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <button key={category} type="button" onClick={() => onChange(category)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active === category ? "bg-[#2F7D5C] text-white" : "border border-[#dce5e0] bg-white text-[#59655f] hover:border-[#2F7D5C]"}`}>
          {category}
        </button>
      ))}
    </div>
  );
}

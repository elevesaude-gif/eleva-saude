import type { Category, Product, SellerSlug, ShippingOption } from "@/types/checkout";

export const sellers: Record<SellerSlug, string> = {
  isabela: "Isabela",
  caio: "Caio",
};

export const categories: Array<"Todos" | Category> = [
  "Todos",
  "Saúde Metabólica",
  "Bem-estar",
  "Kits",
  "Outros",
];

export const products: Product[] = [
  { id: "equilibrio", name: "Kit Equilíbrio", description: "Uma seleção pensada para apoiar uma rotina mais equilibrada.", price: 189.9, category: "Kits", icon: "✦", accent: "#EAF5EF" },
  { id: "vitalidade", name: "Kit Vitalidade", description: "Cuidado diário para mais disposição e leveza na sua jornada.", price: 229.9, category: "Kits", icon: "↗", accent: "#FFF5DC" },
  { id: "nutricional", name: "Acompanhamento Nutricional", description: "Orientação individual para hábitos possíveis e consistentes.", price: 149.9, category: "Saúde Metabólica", icon: "◎", accent: "#E8F1ED" },
  { id: "bem-estar", name: "Protocolo Bem-estar", description: "Uma experiência guiada de autocuidado para sua rotina.", price: 119.9, category: "Bem-estar", icon: "◇", accent: "#F6EEE2" },
  { id: "saude-leve", name: "Combo Saúde Leve", description: "Soluções combinadas para cuidar de você de forma prática.", price: 279.9, category: "Saúde Metabólica", icon: "≈", accent: "#E4F3F0" },
  { id: "consulta", name: "Consulta Inicial", description: "Primeiro encontro para entender seu momento e seus objetivos.", price: 89.9, category: "Outros", icon: "+", accent: "#F2EAF5" },
];

export const shippingOptions: ShippingOption[] = [
  { id: "jadlog", name: "Jadlog Package Centralizado", price: 28.38, estimate: "3 a 5 dias úteis" },
  { id: "loggi", name: "Loggi Express", price: 34.9, estimate: "1 a 3 dias úteis" },
  { id: "jt", name: "J&T Standard", price: 24.9, estimate: "4 a 7 dias úteis" },
];

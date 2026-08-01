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
  { id: "equilibrio", name: "Kit Equilíbrio", description: "Uma seleção pensada para apoiar uma rotina mais equilibrada.", price: 189.9, category: "Kits", icon: "✦", accent: "#C9C6F0", weightGrams: 700, heightCm: 12, widthCm: 20, lengthCm: 28, requiresShipping: true },
  { id: "vitalidade", name: "Kit Vitalidade", description: "Cuidado diário para mais disposição e leveza na sua jornada.", price: 229.9, category: "Kits", icon: "↗", accent: "#E6E8ED", weightGrams: 900, heightCm: 14, widthCm: 22, lengthCm: 30, requiresShipping: true },
  { id: "nutricional", name: "Acompanhamento Nutricional", description: "Orientação individual para hábitos possíveis e consistentes.", price: 149.9, category: "Saúde Metabólica", icon: "◎", accent: "#F7F8FA", weightGrams: 0, heightCm: 0, widthCm: 0, lengthCm: 0, requiresShipping: false },
  { id: "bem-estar", name: "Protocolo Bem-estar", description: "Uma experiência guiada de autocuidado para sua rotina.", price: 119.9, category: "Bem-estar", icon: "◇", accent: "#C9C6F0", weightGrams: 500, heightCm: 10, widthCm: 18, lengthCm: 24, requiresShipping: true },
  { id: "saude-leve", name: "Combo Saúde Leve", description: "Soluções combinadas para cuidar de você de forma prática.", price: 279.9, category: "Saúde Metabólica", icon: "≈", accent: "#E6E8ED", weightGrams: 1100, heightCm: 16, widthCm: 24, lengthCm: 32, requiresShipping: true },
  { id: "consulta", name: "Consulta Inicial", description: "Primeiro encontro para entender seu momento e seus objetivos.", price: 89.9, category: "Outros", icon: "+", accent: "#F7F8FA", weightGrams: 0, heightCm: 0, widthCm: 0, lengthCm: 0, requiresShipping: false },
];

export const internalTestProduct: Product = {
  id: "teste-interno",
  name: "Produto Teste Interno",
  description: "Produto interno para validação de pagamento.",
  price: 1,
  priceCents: 100,
  category: "Outros",
  icon: "·",
  accent: "#F7F8FA",
  weightGrams: 0,
  heightCm: 0,
  widthCm: 0,
  lengthCm: 0,
  requiresShipping: false,
};

export const shippingOptions: ShippingOption[] = [
  { id: "jadlog", provider: "Jadlog", service: "Package Centralizado", priceCents: 2838, deliveryTime: "3 a 5 dias úteis", source: "fallback" },
  { id: "loggi", provider: "Loggi", service: "Express", priceCents: 3490, deliveryTime: "1 a 3 dias úteis", source: "fallback" },
  { id: "jt", provider: "J&T", service: "Standard", priceCents: 2490, deliveryTime: "4 a 7 dias úteis", source: "fallback" },
];

export const internalTestShippingOption: ShippingOption = {
  id: "retirada-teste",
  provider: "eLeve Saúde",
  service: "Sem frete / atendimento digital",
  deliveryTime: "Atendimento digital",
  priceCents: 0,
  source: "teste",
  description: "Opção interna para teste de pagamento.",
};

export const digitalShippingOption: ShippingOption = {
  id: "digital",
  provider: "eLeve Saúde",
  service: "Sem frete / atendimento digital",
  deliveryTime: "Atendimento digital",
  priceCents: 0,
  source: "digital",
};

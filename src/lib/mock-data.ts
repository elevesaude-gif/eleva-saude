import type { Category, Product, SellerSlug, ShippingOption } from "@/types/checkout";

export const sellers: Record<SellerSlug, string> = {
  isabela: "Isabela",
  caio: "Caio",
};

export const categories: Category[] = ["Tirzepatida", "Suplementos", "Shopping"];

// TODO(Melhor Envio): medidas provisórias. Revisar antes de ativar cotações reais.
const provisionalShippingDimensions = {
  weightGrams: 300,
  heightCm: 8,
  widthCm: 16,
  lengthCm: 22,
};

// Caminhos reservados para ativação quando as imagens finais forem aprovadas.
export const productImagePaths = {
  "tirzec-15": "/products/tirzec-15.webp",
  "tirzec-4-ampolas": "/products/tirzec-4-ampolas.webp",
  "tg-15": "/products/tg-15.webp",
  lipoless: "/products/lipoless.webp",
  tirzegen: "/products/tirzegen.webp",
  gluconex: "/products/gluconex.webp",
  tirzedral: "/products/tirzedral.webp",
  "tirzedral-md": "/products/tirzedral-md.webp",
  lipoland: "/products/lipoland.webp",
} as const;

export const products: Product[] = [
  { id: "tirzec-15", name: "Tirzec 15", description: "Apresentação multidose de 60mg em 2mL.", price: 625, priceCents: 62500, category: "Tirzepatida", icon: "15", accent: "#C9C6F0", image: productImagePaths["tirzec-15"], ...provisionalShippingDimensions, requiresShipping: true },
  { id: "tirzec-4-ampolas", name: "Tirzec 4 Ampolas", description: "Para quem busca praticidade no protocolo de controle de peso e saúde metabólica, com 4 ampolas de tirzepatida 15mg/0,5mL.", price: 850, priceCents: 85000, category: "Tirzepatida", icon: "4×", accent: "#E6E8ED", image: productImagePaths["tirzec-4-ampolas"], ...provisionalShippingDimensions, requiresShipping: true },
  { id: "tg-15", name: "T.G 15", description: "Para quem busca controle de peso e saúde metabólica com uma apresentação prática de 4 ampolas de tirzepatida 15mg.", price: 890, priceCents: 89000, category: "Tirzepatida", icon: "TG", accent: "#F7F8FA", image: productImagePaths["tg-15"], ...provisionalShippingDimensions, requiresShipping: true },
  { id: "lipoless", name: "Lipoless", description: "Para quem busca apoio ao controle de peso e saúde metabólica, em frasco multidose com 60mg de tirzepatida em 2,4mL.", price: 720, priceCents: 72000, category: "Tirzepatida", icon: "60", accent: "#C9C6F0", image: productImagePaths.lipoless, ...provisionalShippingDimensions, requiresShipping: true },
  { id: "tirzegen", name: "Tirzegen", description: "Para quem busca uma apresentação liofilizada de tirzepatida 60mg, acompanhada de 2mL de água bacteriostática.", price: 750, priceCents: 75000, category: "Tirzepatida", icon: "TZ", accent: "#E6E8ED", image: productImagePaths.tirzegen, ...provisionalShippingDimensions, requiresShipping: true },
  { id: "gluconex", name: "Gluconex", description: "Para quem busca controle de peso e saúde metabólica com 4 ampolas de tirzepatida 15mg/1mL.", price: 890, priceCents: 89000, category: "Tirzepatida", icon: "GX", accent: "#F7F8FA", image: productImagePaths.gluconex, ...provisionalShippingDimensions, requiresShipping: true },
  { id: "tirzedral", name: "Tirzedral", description: "Para quem busca uma apresentação prática para protocolo de controle de peso e saúde metabólica, com 4 ampolas de 15mg/0,5mL.", price: 950, priceCents: 95000, category: "Tirzepatida", icon: "TD", accent: "#C9C6F0", image: productImagePaths.tirzedral, ...provisionalShippingDimensions, requiresShipping: true },
  { id: "tirzedral-md", name: "Tirzedral MD", description: "Para quem busca tirzepatida em ampola multidose, com 60mg em apresentação única.", price: 950, priceCents: 95000, category: "Tirzepatida", icon: "MD", accent: "#E6E8ED", image: productImagePaths["tirzedral-md"], ...provisionalShippingDimensions, requiresShipping: true },
  { id: "lipoland", name: "Lipoland", description: "Para quem busca controle de peso e saúde metabólica com apresentação multidose de 60mg de tirzepatida em 2mL.", price: 950, priceCents: 95000, category: "Tirzepatida", icon: "LP", accent: "#F7F8FA", image: productImagePaths.lipoland, ...provisionalShippingDimensions, requiresShipping: true },
];

export const internalTestProduct: Product = {
  id: "teste-interno",
  name: "Produto Teste Interno",
  description: "Produto interno para validação de pagamento.",
  price: 1,
  priceCents: 100,
  category: "Shopping",
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

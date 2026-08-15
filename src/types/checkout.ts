export type SellerSlug = "isabela" | "caio" | "bruno";

export const categories = ["Tirzepatida", "Peptídeos Premium", "Suplementos", "Shopping"] as const;

export type Category = (typeof categories)[number];

export type Product = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  priceCents?: number;
  category: Category;
  icon: string;
  accent: string;
  image?: string;
  imageAlt?: string;
  weightGrams: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  requiresShipping: boolean;
  insuredValueCents?: number;
};

export type CartItem = Product & { quantity: number };

export type ShippingOption = {
  id: string;
  provider: string;
  service: string;
  priceCents: number;
  deliveryTime: string;
  source: "melhor_envio" | "fallback" | "teste" | "digital";
  quoteToken?: string;
  description?: string;
};

export type CustomerData = {
  fullName: string;
  cpf: string;
  whatsapp: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  reference: string;
};

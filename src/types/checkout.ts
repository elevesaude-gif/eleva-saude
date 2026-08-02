export type SellerSlug = "isabela" | "caio";

export type Category = "Tirzepatida" | "Suplementos" | "Shopping";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceCents?: number;
  category: Category;
  icon: string;
  accent: string;
  image?: string;
  weightGrams: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  requiresShipping: boolean;
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

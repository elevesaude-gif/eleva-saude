export type SellerSlug = "isabela" | "caio";

export type Category = "Saúde Metabólica" | "Bem-estar" | "Kits" | "Outros";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceCents?: number;
  category: Category;
  icon: string;
  accent: string;
};

export type CartItem = Product & { quantity: number };

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  estimate: string;
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

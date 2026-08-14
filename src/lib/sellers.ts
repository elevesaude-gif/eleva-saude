import type { SellerSlug } from "@/types/checkout";

export type Seller = {
  name: string;
  whatsapp: string;
};

export const sellerConfig: Record<SellerSlug, Seller> = {
  isabela: { name: "Isabela", whatsapp: "5511920180233" },
  caio: { name: "Caio", whatsapp: "5511920180233" },
  bruno: { name: "Bruno", whatsapp: "5511988288220" },
};

export const sellers: Record<SellerSlug, string> = {
  isabela: sellerConfig.isabela.name,
  caio: sellerConfig.caio.name,
  bruno: sellerConfig.bruno.name,
};

export const sellerSlugs = Object.keys(sellerConfig) as SellerSlug[];

export function isSellerSlug(value: unknown): value is SellerSlug {
  return typeof value === "string" && Object.hasOwn(sellerConfig, value);
}

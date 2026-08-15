import type { Product } from "@/types/checkout";

const shippingDimensions = {
  weightGrams: 300,
  heightCm: 8,
  widthCm: 16,
  lengthCm: 22,
  requiresShipping: true,
} as const;

const premiumPeptideCatalog = [
  ["retatrutida-40mg", "Retatrutida 40mg", "Acompanha 1 água bacteriostática de 2mL", 89000, "retatrutida-40mg.webp"],
  ["retatrutida-40mg-4-ampolas", "Retatrutida 40mg 4 ampolas", "Kit com 4 ampolas de Retatrutida 40mg.", 89000, "retatrutida-40mg-4-ampolas.webp"],
  ["retatrutida-80mg", "Retatrutida 80mg", "Retatrutida 80mg em 4,8mL.", 95000, "retatrutida-80mg.webp"],
  ["retatrutida-120mg", "Retatrutida 120mg", "Acompanha 1 água bacteriostática de 2mL.", 110000, "retatrutida-120mg.webp"],
  ["retatrutida-160mg", "Retatrutida 160mg", "Acompanha 1 água bacteriostática de 2mL.", 130000, "retatrutida-160mg.webp"],
  ["tesamorelin-10mg", "Tesamorelin 10mg", "Acompanha 1 água bacteriostática de 2mL.", 69000, "tesamorelin-10mg.webp"],
  ["ghk-cu-100mg", "GHK-CU 100mg", "Já diluído em 2mL.", 69000, "ghk-cu-100mg.webp"],
  ["glow-70mg", "Glow 70mg", "Acompanha 1 água bacteriostática de 2mL.", 89000, "glow-70mg.webp"],
  ["klow-80mg", "KLOW 80mg", "Acompanha 1 água bacteriostática de 2mL.", 95000, "klow-80mg.webp"],
  ["pt-141-10mg", "PT-141 10mg", "Acompanha 1 água bacteriostática de 2mL.", 49000, "pt-141-10mg.webp"],
  ["cbl-514", "CBL-514", "Acompanha 1 água bacteriostática de 2mL.", 89000, "cbl-514.webp"],
  ["slu-pp-33-5mg", "SLU-PP-33 5mg", "Acompanha 1 água bacteriostática de 2mL.", 69000, "slu-pp-33-5mg.webp"],
  ["hgh-frag", "HGH FRAG", "Fragmento HGH em apresentação premium.", 69000, "hgh-frag.webp"],
  ["semax", "SEMAX", "Apresentação premium de Semax.", 89000, "semax.webp"],
  ["aod-5mg", "AOD 5mg", "Acompanha 1 água bacteriostática de 2mL.", 59000, "aod-5mg.webp"],
  ["cjc-1295-ipamorelin-10mg", "CJC 1295 + Ipamorelin 10mg", "Acompanha 1 água bacteriostática de 2mL.", 79000, "cjc-1295-ipamorelin-10mg.webp"],
  ["ipamorelin-10mg", "Ipamorelin 10mg", "Acompanha 1 água bacteriostática de 2mL.", 55000, "ipamorelin-10mg.webp"],
  ["mots-c-10mg", "MOTS-C 10mg", "Acompanha 1 água bacteriostática de 2mL.", 53000, "mots-c-10mg.webp"],
  ["ss-31-10mg", "SS-31 10mg", "Acompanha 1 água bacteriostática de 2mL.", 69000, "ss-31-10mg.webp"],
  ["tb-500-bpc-157-20mg", "TB-500 + BPC-157 20mg", "Acompanha 1 água bacteriostática de 2mL.", 79000, "tb-500-bpc-157-20mg.webp"],
  ["nad-500mg", "NAD+ 500mg", "Apresentação premium de NAD+ 500mg.", 85000, "nad-500mg.webp"],
  ["ghk-cu-100mg-po", "GHK-CU 100MG PÓ", "Acompanha 1 água bacteriostática de 2mL.", 69000, "ghk-cu-100mg-po.webp"],
  ["ghk-cu-50mg", "GHK-CU 50mg", "Já diluído com 1 água bacteriostática.", 49000, "ghk-cu-50mg.webp"],
  ["ghk-cu-50mg-po-liofilizado", "GHK-CU 50MG PÓ LIOFILIZADO", "GHK-CU 50MG PÓ LIOFILIZADO + 2 mL DE ÁGUA BACTERIOSTÁTICA.", 49000, "ghk-cu-50mg-po-liofilizado.webp"],
] as const;

export const premiumPeptideProducts: Product[] = premiumPeptideCatalog.map(
  ([id, name, description, priceCents, image]) => ({
    id,
    name,
    description,
    price: priceCents / 100,
    priceCents,
    category: "Peptídeos Premium",
    icon: name.slice(0, 2).toUpperCase(),
    accent: "#F7F8FA",
    image: `/products/peptideos-premium/${image}`,
    imageAlt: name,
    insuredValueCents: priceCents,
    ...shippingDimensions,
  }),
);

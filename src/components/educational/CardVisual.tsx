import Image from "next/image";

export type VisualVariant =
  | "procedure" | "prescription" | "support" | "coldChain" | "safety"
  | "price" | "social" | "fakeProduct" | "paraguay" | "activeIngredient"
  | "hunger" | "satiety" | "glucose" | "stomach" | "weightSupport"
  | "mounjaro" | "wegovy" | "ozempic" | "saxenda" | "checklist"
  | "journey" | "nutrition" | "muscle" | "sideEffects" | "maintenance"
  | "whatsapp";

const visualImages: Record<VisualVariant, string> = {
  procedure: "/educational/procedencia.webp",
  prescription: "/educational/acompanhamento.webp",
  support: "/educational/acompanhamento.webp",
  coldChain: "/educational/conservacao.webp",
  safety: "/educational/checklist.webp",
  price: "/educational/comparativo.webp",
  social: "/educational/acompanhamento.webp",
  fakeProduct: "/educational/procedencia.webp",
  paraguay: "/educational/procedencia.webp",
  activeIngredient: "/educational/dose-apresentacao.webp",
  hunger: "/educational/comparativo.webp",
  satiety: "/educational/comparativo.webp",
  glucose: "/educational/comparativo.webp",
  stomach: "/educational/comparativo.webp",
  weightSupport: "/educational/jornada.webp",
  mounjaro: "/educational/comparativo.webp",
  wegovy: "/educational/comparativo.webp",
  ozempic: "/educational/comparativo.webp",
  saxenda: "/educational/comparativo.webp",
  checklist: "/educational/checklist.webp",
  journey: "/educational/jornada.webp",
  nutrition: "/educational/acompanhamento.webp",
  muscle: "/educational/acompanhamento.webp",
  sideEffects: "/educational/checklist.webp",
  maintenance: "/educational/jornada.webp",
  whatsapp: "/educational/jornada.webp",
};

export function CardVisual({ variant, compact = false, imageSrc, imageAlt = "", imagePriority = false }: { variant: VisualVariant; compact?: boolean; imageSrc?: string; imageAlt?: string; imagePriority?: boolean }) {
  return <div className={`relative overflow-hidden bg-[#E5F7EE] ${compact ? "h-24 sm:h-28" : "h-28 sm:h-40"}`}>
    <Image src={imageSrc ?? visualImages[variant]} alt={imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" preload={imagePriority} />
    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/25 via-transparent to-white/5" />
  </div>;
}

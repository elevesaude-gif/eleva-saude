import Link from "next/link";
import { CardVisual, type VisualVariant } from "./CardVisual";

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  visualVariant: VisualVariant;
  imageSrc?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  href?: string;
  cta?: string;
  compact?: boolean;
};

export function EducationalCard({ title, description, eyebrow, visualVariant, imageSrc, imageAlt, imagePriority, href, cta, compact = false }: Props) {
  const content = <>
    <CardVisual variant={visualVariant} compact={compact} imageSrc={imageSrc} imageAlt={imageAlt ?? `Visual sobre ${title}`} imagePriority={imagePriority} />
    <div className={compact ? "p-4" : "p-5 sm:p-6"}>
      {eyebrow && <p className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-[#047857]">{eyebrow}</p>}
      <h3 className={`${compact ? "text-base" : "text-lg"} font-bold leading-snug text-[#0D1B2A]`}>{title}</h3>
      {description && <p className="mt-3 text-sm leading-6 text-[#344563]">{description}</p>}
      {cta && <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#047857]">{cta}<span aria-hidden>→</span></span>}
    </div>
  </>;
  const className = "group block h-full overflow-hidden rounded-[24px] border border-[#DDE5E1] bg-white shadow-[0_10px_32px_rgba(13,27,42,.055)] transition duration-300 hover:-translate-y-1 hover:border-[#A7D9C2] hover:shadow-[0_18px_44px_rgba(13,27,42,.1)]";
  return href ? <Link href={href} className={className}>{content}</Link> : <article className={className}>{content}</article>;
}

import Image from "next/image";

type BrandLogoProps = {
  negative?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ negative = false, compact = false, className = "" }: BrandLogoProps) {
  const src = compact
    ? negative ? "/brand/eleve-icone-negativo.png" : "/brand/eleve-icone.png"
    : negative ? "/brand/eleve-logo-negativo.png" : "/brand/eleve-logo-principal.png";

  return (
    <span className={`relative block shrink-0 overflow-hidden ${compact ? "size-10" : "h-14 w-36"} ${className}`}>
      <Image
        src={src}
        alt={compact ? "" : "eLeve Saúde"}
        width={1536}
        height={1024}
        className={`absolute left-1/2 top-1/2 h-auto max-w-none -translate-x-1/2 -translate-y-1/2 ${compact ? "w-28" : "w-72"}`}
        priority={!compact}
      />
    </span>
  );
}

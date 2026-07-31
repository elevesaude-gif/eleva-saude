import Image from "next/image";

type BrandLogoProps = {
  negative?: boolean;
  compact?: boolean;
  size?: "small" | "default" | "large";
  className?: string;
};

const logoSizes = {
  small: { frame: "h-12 w-32", image: "w-64" },
  default: { frame: "h-14 w-36", image: "w-72" },
  large: { frame: "h-16 w-40", image: "w-80" },
};

export function BrandLogo({ negative = false, compact = false, size = "default", className = "" }: BrandLogoProps) {
  const src = compact
    ? negative ? "/brand/eleve-icone-negativo.png" : "/brand/eleve-icone.png"
    : negative ? "/brand/eleve-logo-negativo.png" : "/brand/eleve-logo-principal.png";
  const dimensions = logoSizes[size];

  return (
    <span className={`relative block shrink-0 overflow-hidden ${compact ? "size-10" : dimensions.frame} ${className}`}>
      <Image
        src={src}
        alt={compact ? "" : "eLeve Saúde"}
        width={1536}
        height={1024}
        className={`absolute left-1/2 top-1/2 h-auto max-w-none -translate-x-1/2 -translate-y-1/2 ${compact ? "w-28" : dimensions.image}`}
        priority={!compact}
      />
    </span>
  );
}

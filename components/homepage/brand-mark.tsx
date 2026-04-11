import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark${compact ? " is-compact" : ""}`}>
      <div className="brand-mark-icon">
        <Image
          src="/brand/mascots/uglymanlings-duck-primary.png"
          alt="Ugly Manling duck mascot"
          width={72}
          height={72}
          className="brand-mark-image"
          priority
        />
      </div>
      <div className="brand-mark-copy">
        <p className="brand-mark-title">Ugly Manling</p>
        <p className="brand-mark-subtitle">Don't go bald. Go sexy.</p>
      </div>
    </div>
  );
}

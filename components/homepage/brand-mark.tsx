type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark${compact ? " is-compact" : ""}`}>
      <div className="brand-mark-icon" aria-hidden="true">
        <span className="brand-mark-monogram">UM</span>
      </div>
      <div className="brand-mark-copy">
        <p className="brand-mark-title">Ugly Manling</p>
        <p className="brand-mark-subtitle">Balding is a choice</p>
      </div>
    </div>
  );
}

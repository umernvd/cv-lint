interface MaterialIconProps {
  icon: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}

export function MaterialIcon({ icon, className = '', filled = false, style }: MaterialIconProps): React.JSX.Element {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...style }}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

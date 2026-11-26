import type { BoxItemId, ProductFinish } from '../data/finishes';

interface BoxThumbnailsProps {
  item: BoxItemId;
  finish: ProductFinish;
}

export function BoxThumbnail({ item, finish }: BoxThumbnailsProps) {
  if (item === 'headphones') {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
        <path
          d="M12,26 C12,14 17,9 24,9 C31,9 36,14 36,26"
          fill="none"
          stroke={finish.metalHex}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <rect
          x="8.5"
          y="23"
          width="7.5"
          height="13.5"
          rx="3.75"
          fill={finish.shellHex}
          stroke={finish.accentHex}
          strokeWidth="1.2"
        />
        <rect
          x="32"
          y="23"
          width="7.5"
          height="13.5"
          rx="3.75"
          fill={finish.shellHex}
          stroke={finish.accentHex}
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (item === 'case') {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
        <rect
          x="10"
          y="10"
          width="28"
          height="28"
          rx="9"
          fill={finish.canopyHex}
          stroke={finish.accentHex}
          strokeWidth="1.2"
        />
        <path
          d="M10,20 L38,20 L38,17 C38,12 34,10 29,10 L19,10 C14,10 10,12 10,17 Z"
          fill={finish.shellHex}
        />
        <rect x="20" y="19" width="8" height="2.4" rx="1.2" fill={finish.metalHex} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
      <line
        x1="17"
        y1="15"
        x2="17"
        y2="37"
        stroke={finish.accentHex}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="31"
        y1="15"
        x2="31"
        y2="37"
        stroke={finish.accentHex}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect x="14.5" y="10" width="5" height="6" rx="1.2" fill={finish.metalHex} />
      <rect x="28.5" y="10" width="5" height="6" rx="1.2" fill={finish.metalHex} />
    </svg>
  );
}

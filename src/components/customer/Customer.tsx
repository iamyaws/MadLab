import type { JSX } from 'react';
import type { CustomerVisualKind } from '../../lib/types';

/**
 * Customer SVG component. Renders one of eight hand-coded portraits keyed by
 * `kind`. Direct transcription from the wireframe at
 * `docs/wireframes/hifi-c-v2.html` lines 374-449. The wireframe's
 * `var(--rose)` etc. CSS variables are replaced with hex literals so the
 * component is self-contained outside the wireframe's CSS-var scope.
 *
 * Sizing: width is the `size` prop (default 140), height auto-derives at
 * `size * 1.05` so the SVG keeps the wireframe's tall-ish aspect.
 *
 * Accessibility: when `ariaLabel` is provided the SVG renders with
 * `role="img"` and the label, making it announce as an image with a name.
 * When omitted the SVG is decorative (`aria-hidden="true"`); consumers that
 * already announce the customer name elsewhere should leave it omitted to
 * avoid redundant announcements.
 *
 * Color tokens (kept in sync with `tailwind.config.ts`):
 *   --rose         #FF6F61
 *   --primary      #3CC4DA
 *   --primary-deep #1F88A0
 *   --gold         #FFC93C
 *   --plum         #B970D2
 *   --sage         #7DD66F
 *   --paper        #FFFBEF
 *   --ink          #1F1A2A
 *
 * Skin / fabric / metal palettes:
 *   skin (oma)         #F5DCC4
 *   white hair (oma)   #E5E0D2
 *   skin (kid)         #F8D9B4
 *   bag fabric (kit)   #F2E9D2
 *   metal body         #C9CDD6
 *   metal head plate   #E0E4EC
 *   metal rivets       #A9AEBA
 */
export interface CustomerProps {
  /**
   * Which portrait to render. Matches the visual-kind discriminator on the
   * Customer record.
   */
  kind: CustomerVisualKind;
  /**
   * Width in pixels. Height auto-derives at size * 1.05. Default 140.
   */
  size?: number;
  /**
   * When set, the SVG announces with `role="img"` + this label. Omit for
   * decorative use (the SVG becomes `aria-hidden="true"`).
   */
  ariaLabel?: string;
}

const STROKE = '#1F1A2A';
const STROKE_WIDTH = 2.6;

export function Customer({
  kind,
  size = 140,
  ariaLabel,
}: CustomerProps): JSX.Element {
  const width = size;
  const height = size * 1.05;

  const a11y = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };

  const common = {
    width,
    height,
    viewBox: '0 0 140 150',
    fill: 'none',
    stroke: STROKE,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...a11y,
  };

  if (kind === 'pip') {
    return (
      <svg {...common}>
        <ellipse cx="70" cy="92" rx="44" ry="40" fill="#FF6F61" />
        <path d="M30 70 Q34 50 50 56" />
        <path d="M110 70 Q106 50 90 56" />
        <ellipse cx="58" cy="84" rx="6" ry="7" fill="#fff" />
        <circle cx="59" cy="86" r="2.5" fill={STROKE} />
        <ellipse cx="82" cy="84" rx="6" ry="7" fill="#fff" />
        <circle cx="83" cy="86" r="2.5" fill={STROKE} />
        <path d="M62 100 Q70 106 78 100" />
        <circle cx="48" cy="76" r="3" fill="rgba(255,200,200,0.7)" />
        <circle cx="92" cy="76" r="3" fill="rgba(255,200,200,0.7)" />
      </svg>
    );
  }

  if (kind === 'kid') {
    return (
      <svg {...common}>
        <path
          d="M28 64 Q36 30 70 30 Q104 30 112 64 L112 70 H28 Z"
          fill="#3CC4DA"
        />
        <ellipse cx="70" cy="86" rx="34" ry="36" fill="#F8D9B4" />
        <ellipse cx="58" cy="86" rx="3" ry="4" fill={STROKE} />
        <ellipse cx="82" cy="86" rx="3" ry="4" fill={STROKE} />
        <path d="M62 102 Q70 108 78 102" />
        <path d="M70 30 V18" />
        <circle cx="70" cy="14" r="4" fill="#FFC93C" />
        <path d="M40 130 H100" />
        <path d="M50 122 V140 M90 122 V140" />
      </svg>
    );
  }

  if (kind === 'moonling') {
    return (
      <svg {...common}>
        <path
          d="M70 18 Q104 28 104 78 Q104 122 70 130 Q98 120 98 78 Q98 28 70 18 Z"
          fill="#FFC93C"
        />
        <circle cx="58" cy="74" r="3" fill={STROKE} />
        <path d="M50 92 Q60 100 72 96" />
        <path d="M28 30 l4 4 -4 4 -4 -4 z" fill="#FFC93C" />
        <path d="M114 110 l3 3 -3 3 -3 -3 z" fill="#FFC93C" />
      </svg>
    );
  }

  if (kind === 'crunch') {
    return (
      <svg {...common}>
        {/* tin-knight robot */}
        <rect x="36" y="56" width="68" height="64" rx="10" fill="#C9CDD6" />
        <rect x="44" y="32" width="52" height="32" rx="8" fill="#E0E4EC" />
        <rect x="54" y="42" width="10" height="8" fill={STROKE} />
        <rect x="76" y="42" width="10" height="8" fill={STROKE} />
        <path d="M62 56 H78" />
        <rect x="64" y="20" width="12" height="14" fill="#A9AEBA" />
        <circle cx="70" cy="18" r="4" fill="#FF6F61" />
        <path d="M40 76 H100 M40 92 H100" />
        <rect x="22" y="68" width="14" height="34" rx="4" fill="#A9AEBA" />
        <rect x="104" y="68" width="14" height="34" rx="4" fill="#A9AEBA" />
      </svg>
    );
  }

  if (kind === 'twig') {
    return (
      <svg {...common}>
        {/* sage forest creature */}
        <ellipse cx="70" cy="96" rx="40" ry="38" fill="#7DD66F" />
        <path d="M50 64 Q40 40 56 36 Q60 50 60 64" fill="#7DD66F" />
        <path d="M90 64 Q100 40 84 36 Q80 50 80 64" fill="#7DD66F" />
        <ellipse cx="60" cy="92" rx="3.5" ry="4.5" fill={STROKE} />
        <ellipse cx="80" cy="92" rx="3.5" ry="4.5" fill={STROKE} />
        <path d="M62 106 Q70 110 78 106" />
        <path d="M44 80 q-6 4 -10 12 M96 80 q6 4 10 12" />
      </svg>
    );
  }

  if (kind === 'kit') {
    return (
      <svg {...common}>
        {/* paper-bag ghost */}
        <path
          d="M40 48 Q42 38 70 36 Q98 38 100 48 L100 124 Q86 132 70 130 Q54 132 40 124 Z"
          fill="#F2E9D2"
        />
        <path d="M40 48 q4 -4 12 0 q4 -4 12 0 q4 -4 12 0 q4 -4 12 0 q4 -4 12 0" />
        <ellipse cx="60" cy="78" rx="4" ry="6" fill={STROKE} />
        <ellipse cx="80" cy="78" rx="4" ry="6" fill={STROKE} />
        <path d="M60 96 Q70 110 80 96" />
        <path d="M58 100 L58 108 M70 104 L70 114 M82 100 L82 108" />
      </svg>
    );
  }

  if (kind === 'oma') {
    return (
      <svg {...common}>
        {/* gran with knitting */}
        <path
          d="M30 100 Q30 60 70 60 Q110 60 110 100 V130 H30 Z"
          fill="#B970D2"
        />
        <ellipse cx="70" cy="74" rx="28" ry="30" fill="#F5DCC4" />
        <circle
          cx="70"
          cy="44"
          r="14"
          fill="#E5E0D2"
          stroke={STROKE}
          strokeWidth={STROKE_WIDTH}
        />
        <circle cx="60" cy="76" r="6" />
        <circle cx="80" cy="76" r="6" />
        <line x1="66" y1="76" x2="74" y2="76" />
        <path d="M62 92 Q70 96 78 92" />
        {/* yarn ball */}
        <circle cx="110" cy="118" r="8" fill="#FF6F61" />
        <path d="M104 116 q4 -4 12 4 M106 122 q4 -2 8 -2" />
      </svg>
    );
  }

  // Default 'creature' fallback for un-arted daily visitors.
  return (
    <svg {...common}>
      <ellipse cx="70" cy="86" rx="46" ry="34" fill="#7DD66F" />
      <path d="M32 64 L24 38 L46 54 Z" fill="#7DD66F" />
      <path d="M108 64 L116 38 L94 54 Z" fill="#7DD66F" />
      <ellipse cx="58" cy="80" rx="3.5" ry="4" fill={STROKE} />
      <ellipse cx="82" cy="80" rx="3.5" ry="4" fill={STROKE} />
      <ellipse cx="70" cy="94" rx="6" ry="4" fill={STROKE} />
      <path d="M62 102 Q70 110 78 102" />
    </svg>
  );
}

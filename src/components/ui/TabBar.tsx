import { useNavigate } from 'react-router-dom';

/**
 * The four tab keys the bar exposes. `lab` lands on the workshop, `buch` on
 * the catalogue flipbook stub, `laden` on the (Phase 2 stubbed) shop, and
 * `taglich` on the Daily Special arc.
 */
export type TabKey = 'lab' | 'buch' | 'laden' | 'taglich';

/**
 * TabBar (M17). The four-tab navigation bar mounted across Workshop,
 * Catalogue, and Daily pages. The bar is absolutely positioned at the
 * bottom of the phone shell (matching the M9 placeholder geometry) so
 * pages render their content above it without re-doing the layout maths.
 *
 * Behavior:
 *   - Tapping an inactive tab navigates to its route.
 *   - The Laden tab is a Phase 2 stub: rendered disabled (40% opacity,
 *     no click handler) until the cosmetics shop ships in Phase 3+.
 *   - Tabs render with `aria-current="page"` on the active one, plus a
 *     gold pill with the inset shadow that the wireframe uses for the
 *     "you are here" state.
 *
 * The bar is intentionally absolute-positioned: each consuming page
 * already pads its content to clear the 90px floor (72px tall + 18px
 * bottom inset) so the bar overlays the shell without re-layout.
 */
export interface TabBarProps {
  /** Which tab to mark as active. Drives the gold-pill highlight. */
  active: TabKey;
}

interface TabConfig {
  key: TabKey;
  labelDe: string;
  route: string;
  glyph: string;
  disabled?: boolean;
}

const TABS: TabConfig[] = [
  { key: 'lab', labelDe: 'Lab', route: '/', glyph: 'Lab' },
  { key: 'buch', labelDe: 'Buch', route: '/catalogue', glyph: 'Buch' },
  // Laden (shop) is a Phase 2 stub; the cosmetics surface lands later.
  { key: 'laden', labelDe: 'Laden', route: '/shop', glyph: 'Laden', disabled: true },
  { key: 'taglich', labelDe: 'Täglich', route: '/daily', glyph: '★' },
];

export function TabBar({ active }: TabBarProps) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="absolute left-[18px] right-[18px] bottom-[18px] h-[72px] bg-paper border-[2.5px] border-ink rounded-[30px] flex items-center justify-around shadow-[0_8px_0_rgba(31,26,42,0.10)] px-2"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const isDisabled = tab.disabled === true;
        const baseClasses =
          'w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black';
        const sizeClass =
          tab.glyph.length > 2 ? 'text-[15px]' : 'text-[20px]';
        const stateClass = isActive
          ? 'bg-gold text-ink shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)]'
          : isDisabled
            ? 'text-ink-soft opacity-40 cursor-not-allowed'
            : 'text-ink-soft';

        if (isDisabled) {
          return (
            <span
              key={tab.key}
              aria-disabled="true"
              aria-label={`${tab.labelDe} (bald da)`}
              className={`${baseClasses} ${sizeClass} ${stateClass}`}
            >
              {tab.glyph}
            </span>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            aria-label={tab.labelDe}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => navigate(tab.route)}
            className={`${baseClasses} ${sizeClass} ${stateClass}`}
          >
            {tab.glyph}
          </button>
        );
      })}
    </nav>
  );
}

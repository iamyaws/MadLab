import type { Trait, TraitScores } from '../../lib/types';

/**
 * SensorGrid. The 4-cell "judge" row shown in the test chamber. Each cell
 * shows one trait's German label, its glyph, and 0..3 dots that fill in over
 * the 3-second test animation as TestPage tween-counts each trait toward its
 * resolved score.
 *
 * `activeTraits` highlights cells whose trait is "firing right now" with the
 * gold background variant from the wireframe. TestPage flips this set during
 * the burst so cells light up in time with their dots filling. Default to an
 * empty set when the test is at rest.
 *
 * Wireframe parity: `.judge` + `.judge-cell` blocks at lines 286-296 of
 * docs/wireframes/hifi-c-v2.html.
 */
export interface SensorGridProps {
  scores: TraitScores;
  activeTraits?: Set<Trait>;
}

interface TraitCellMeta {
  key: Trait;
  glyph: string;
  labelDe: string;
}

const CELL_META: TraitCellMeta[] = [
  { key: 'fun', glyph: '😊', labelDe: 'Spaß' },
  { key: 'zappy', glyph: '⚡', labelDe: 'Zapp' },
  { key: 'cozy', glyph: '🧶', labelDe: 'Kuschel' },
  { key: 'boom', glyph: '💥', labelDe: 'Bumm' },
];

export function SensorGrid({ scores, activeTraits }: SensorGridProps) {
  return (
    <div
      className="grid grid-cols-4 gap-2"
      role="group"
      aria-label="Spuren-Sensoren"
    >
      {CELL_META.map((cell) => {
        const score = scores[cell.key] ?? 0;
        const isActive = activeTraits?.has(cell.key) ?? false;
        const cellClass = [
          'flex flex-col items-center gap-1 rounded-2xl border-2 border-ink px-1.5 py-2',
          'text-[12px] font-extrabold uppercase tracking-wider',
          isActive ? 'bg-gold' : 'bg-paper',
        ].join(' ');
        return (
          <div
            key={cell.key}
            className={cellClass}
            aria-label={`${cell.labelDe} ${score} von 3`}
          >
            <div className="text-[22px] leading-none" aria-hidden="true">
              {cell.glyph}
            </div>
            <div>{cell.labelDe}</div>
            <div
              className="flex gap-[3px] mt-0.5"
              aria-hidden="true"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full border-[1.5px] border-ink ${
                    i < score ? 'bg-ink' : 'bg-paper'
                  }`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

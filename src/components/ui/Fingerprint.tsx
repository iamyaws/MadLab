import type { Trait, TraitScores } from '../../lib/types';

/**
 * Fingerprint. The 4-trait dot scoreline shown next to the workshop "X / 4
 * picked" chip and on every catalogue card. Pure presentational: takes a
 * TraitScores object and renders 4 trait groups, each with a glyph and 0..3
 * filled dots.
 *
 * Two visual variants:
 *   - default ('final'): solid border, paper background. Used on resolved
 *     inventions (catalogue, reaction screen).
 *   - predict: dashed border, transparent background, "vorhersage" eyebrow.
 *     Used while the player is still picking parts (live preview).
 *
 * The wireframe at docs/wireframes/hifi-c-v2.html (`.fingerprint`) is the
 * visual source of truth; this component re-implements the same dot-cluster
 * pattern in Tailwind.
 */
export interface FingerprintProps {
  scores: TraitScores;
  predict?: boolean;
  className?: string;
}

interface TraitMeta {
  key: Trait;
  glyph: string;
  labelDe: string;
}

const TRAIT_META: TraitMeta[] = [
  { key: 'fun', glyph: '😊', labelDe: 'Spaß' },
  { key: 'zappy', glyph: '⚡', labelDe: 'Zapp' },
  { key: 'cozy', glyph: '🧶', labelDe: 'Kuschel' },
  { key: 'boom', glyph: '💥', labelDe: 'Bumm' },
];

export function Fingerprint({ scores, predict, className }: FingerprintProps) {
  const wrapperBase =
    'inline-flex items-center gap-2 border-2 border-ink rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider';
  const wrapperVariant = predict
    ? 'border-dashed bg-transparent'
    : 'bg-paper';
  const wrapperClass = [wrapperBase, wrapperVariant, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass} aria-label="Spuren-Fingerabdruck">
      {predict ? (
        <span className="text-ink-soft normal-case font-extrabold tracking-normal text-[10px] mr-1">
          vorhersage
        </span>
      ) : null}
      {TRAIT_META.map((meta) => {
        const score = scores[meta.key] ?? 0;
        return (
          <div
            key={meta.key}
            className="inline-flex items-center gap-[3px]"
            aria-label={`${meta.labelDe} ${score} von 3`}
          >
            <span
              aria-hidden="true"
              className="text-[10px] mr-0.5 text-ink-soft"
            >
              {meta.glyph}
            </span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`w-[7px] h-[7px] rounded-full border-[1.5px] border-ink ${
                  i < score ? 'bg-ink' : 'bg-paper'
                }`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

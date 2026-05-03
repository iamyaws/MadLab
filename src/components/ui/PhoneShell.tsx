import type { ReactNode } from 'react';

/**
 * PhoneShell. The 390x820 cel-shaded phone-shell wrapper used as the design
 * canvas in Phase 1. Visual proportions match the v2 hi-fi wireframe at
 * docs/wireframes/hifi-c-v2.html (`.phone`, `.phone::before`, `.status`).
 *
 * Includes:
 *   - paper-colored body, 2.5px ink border, 48px corner radius
 *   - ink-colored dynamic-island pill at the top (120x30, centered)
 *   - status bar row at the top (left: time, right: signal/wifi/battery)
 *   - children slot for screen content (rendered below the status bar)
 *   - layered drop shadow: 3px hard offset plus a soft 36px ambient
 *
 * Phase 2+ may drop this wrapper for a full-bleed responsive layout.
 */
export interface PhoneShellProps {
  children: ReactNode;
  statusTime?: string;
  className?: string;
}

const SHELL_BASE =
  'relative flex flex-col overflow-hidden bg-paper border-[2.5px] border-ink ' +
  'rounded-[48px] w-[390px] h-[820px] ' +
  'shadow-[0_12px_0_rgba(31,26,42,0.10),0_36px_60px_rgba(31,26,42,0.18)]';

export function PhoneShell({
  children,
  statusTime = '9:41',
  className,
}: PhoneShellProps) {
  const wrapperClass = className ? `${SHELL_BASE} ${className}` : SHELL_BASE;

  return (
    <div className={wrapperClass}>
      {/* Dynamic island. Ink-colored pill centered at the top of the shell. */}
      <div
        aria-hidden="true"
        className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-ink rounded-[18px] z-30"
      />

      {/* Status bar. Time on the left, signal/wifi/battery cluster on the right. */}
      <div
        className="absolute top-0 left-0 right-0 h-[54px] flex items-center justify-between px-7 pt-4 font-body font-extrabold text-[15px] text-ink z-20"
        role="presentation"
      >
        <div>{statusTime}</div>
        <div className="flex items-center gap-1.5 text-[13px]">
          <span aria-hidden="true">{'●●●●'}</span>
          <span aria-hidden="true">Wi-Fi</span>
          <span aria-hidden="true">100%</span>
        </div>
      </div>

      {children}
    </div>
  );
}

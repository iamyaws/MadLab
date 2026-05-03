import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PartIcon } from '../PartIcon';
import { PART_ICONS } from '../../../data/partIcons';

describe('PartIcon SVG', () => {
  const partIds = Object.keys(PART_ICONS);

  it('exposes 13 part ids in PART_ICONS', () => {
    expect(partIds).toHaveLength(13);
    expect(partIds).toContain('moonbeam');
  });

  it.each(partIds)('renders %s without throwing', (partId) => {
    expect(() => render(<PartIcon partId={partId} />)).not.toThrow();
  });

  it('uses the default size of 28 when no size prop is passed', () => {
    const { container } = render(<PartIcon partId="cog" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('28');
    expect(svg?.getAttribute('height')).toBe('28');
  });

  it('respects a custom size prop', () => {
    const { container } = render(<PartIcon partId="cog" size={48} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('48');
    expect(svg?.getAttribute('height')).toBe('48');
  });

  it('exposes role="img" + aria-label when ariaLabel is provided', () => {
    const { getByLabelText } = render(
      <PartIcon partId="cog" ariaLabel="Zahnrad" />,
    );
    const svg = getByLabelText('Zahnrad');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('role')).toBe('img');
  });

  it('marks the svg aria-hidden when no ariaLabel is provided', () => {
    const { container } = render(<PartIcon partId="cog" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('renders a fallback for an unknown partId without throwing', () => {
    const { container } = render(<PartIcon partId="not-a-real-part" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Fallback box uses a dashed rect with no fill colors.
    const rect = svg?.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('stroke-dasharray')).toBe('3 3');
  });

  it('keeps the 0 0 32 32 viewBox so all icons share one coordinate system', () => {
    const { container } = render(<PartIcon partId="bolt" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 32 32');
  });
});

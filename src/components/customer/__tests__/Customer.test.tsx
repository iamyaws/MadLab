import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Customer } from '../Customer';
import type { CustomerVisualKind } from '../../../lib/types';

describe('Customer SVG', () => {
  const kinds: CustomerVisualKind[] = [
    'pip',
    'kid',
    'crunch',
    'oma',
    'twig',
    'kit',
    'moonling',
    'creature',
  ];

  it.each(kinds)('renders %s without throwing', (kind) => {
    expect(() => render(<Customer kind={kind} />)).not.toThrow();
  });

  it('uses the default size of 140 when no size prop is passed', () => {
    const { container } = render(<Customer kind="pip" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('140');
  });

  it('respects a custom size prop', () => {
    const { container } = render(<Customer kind="pip" size={80} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('80');
  });

  it('exposes role="img" + aria-label when ariaLabel is provided', () => {
    const { getByLabelText } = render(<Customer kind="pip" ariaLabel="Pip" />);
    const svg = getByLabelText('Pip');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('role')).toBe('img');
  });

  it('marks the svg aria-hidden when no ariaLabel is provided', () => {
    const { container } = render(<Customer kind="pip" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });
});

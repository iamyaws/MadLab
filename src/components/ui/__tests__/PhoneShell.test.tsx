import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PhoneShell } from '../PhoneShell';

describe('PhoneShell', () => {
  it('renders children inside the shell', () => {
    render(<PhoneShell>hello</PhoneShell>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders the default status time', () => {
    render(<PhoneShell>content</PhoneShell>);
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('honors a custom status time prop', () => {
    render(<PhoneShell statusTime="10:23">content</PhoneShell>);
    expect(screen.getByText('10:23')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDefined();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when loading is true', () => {
    render(<Button loading>Loading State</Button>);
    
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBeTruthy();
  });

  it('renders different variants via class names', () => {
    const { container: primaryContainer } = render(<Button variant="primary">Primary</Button>);
    const { container: outlineContainer } = render(<Button variant="outline">Outline</Button>);
    
    // Note: Checking class structure differences
    expect(primaryContainer.innerHTML).not.toEqual(outlineContainer.innerHTML);
  });
});

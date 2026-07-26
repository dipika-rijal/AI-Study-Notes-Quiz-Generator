import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child').textContent).toBe('Safe content');
  });

  it('renders fallback UI when a child throws', () => {
    // Suppress console.error for this expected error during testing
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const ProblemChild = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText(/unexpected error occurred/i)).toBeDefined();
    
    consoleError.mockRestore();
  });
});

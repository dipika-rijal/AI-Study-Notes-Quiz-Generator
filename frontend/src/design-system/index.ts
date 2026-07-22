/**
 * Design System
 * Complete design system with tokens and reusable components
 */

// Export all tokens
export * from './tokens';

// Export all components
export * from './components';

/**
 * Design System Overview
 * 
 * Tokens:
 * - colors.ts: Color palette for light/dark themes
 * - typography.ts: Font sizes, weights, line heights
 * - spacing.ts: 4px base spacing scale
 * - border-radius.ts: Consistent rounded corners
 * - shadows.ts: Elevation and depth
 * - animations.ts: Motion design constants
 * 
 * Components:
 * - Button.tsx: Primary, secondary, outline, ghost, danger variants
 * - Card.tsx: Default, elevated, outlined, flat variants
 * - Input.tsx: Default, filled, outlined variants with validation
 * - Modal.tsx: Accessible modal with animations
 * - Badge.tsx: Status indicators with variants
 * - Toast.tsx: Notification system with container
 * - Loading.tsx: Spinner, dots, pulse, skeleton loaders
 * 
 * Usage:
 * import { Button, Card, Input } from '@/design-system';
 * 
 * All components use CSS custom properties defined in index.css
 * for consistent theming across light and dark modes.
 */

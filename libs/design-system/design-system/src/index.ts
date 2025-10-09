/**
 * @worse-and-pricier/design-system
 *
 * Meta-package that bundles the complete design system for Angular applications.
 * This package includes:
 * - Design tokens (colors, typography, spacing)
 * - Global styles and theming
 * - UI component library
 *
 * Installation:
 * npm install @worse-and-pricier/design-system
 *
 * This automatically installs all three sub-packages:
 * - @worse-and-pricier/design-system-tokens
 * - @worse-and-pricier/design-system-styles
 * - @worse-and-pricier/design-system-ui
 */

// Re-export everything from tokens
export * from '@worse-and-pricier/design-system-tokens';

// Re-export everything from styles
export * from '@worse-and-pricier/design-system-styles';

// Re-export everything from ui
export * from '@worse-and-pricier/design-system-ui';

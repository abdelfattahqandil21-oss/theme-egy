/**
 * Defines where the theme's color palette originates.
 *
 * @remarks
 * - `'config'`: Colors are provided via the `colors` property in
 *   {@link ThemeConfig}. This is the default behavior and is fully
 *   backward compatible with existing usage.
 * - `'css'`: Colors are read from CSS custom properties on the
 *   document root (`<html>`). Variables must follow the `--theme-*`
 *   naming convention (e.g. `--theme-primary`, `--theme-background`).
 *   Mode-specific values are handled via CSS class/attribute selectors
 *   like `.dark --theme-primary` or `[data-theme="dark"] --theme-primary`.
 *   This mode is designed for use with Tailwind CSS v4, CSS Design
 *   Tokens, or any workflow where colors are defined exclusively in CSS.
 *
 * @example
 * ```typescript
 * // Config source (default)
 * provideTheme({
 *   colorSource: 'config',
 *   colors: {
 *     light: { primary: '#2563eb', ... },
 *     dark: { primary: '#3b82f6', ... },
 *   },
 * });
 *
 * // CSS source
 * provideTheme({
 *   colorSource: 'css',
 * });
 * ```
 */
export type ColorSource = 'config' | 'css';

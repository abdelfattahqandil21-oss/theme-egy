/**
 * A set of color values that define a theme's palette.
 *
 * @remarks
 * Includes a small set of required, well-known tokens that every theme
 * must define, plus an open index signature so consumers (and future
 * egy-* libraries) can extend the palette with additional named colors
 * (e.g. `success`, `warning`, `accent`) without needing a breaking
 * change to this interface.
 *
 * Values are expected to be valid CSS color values (hex, rgb, hsl, etc.)
 * since they are written directly as CSS custom properties.
 *
 * @example
 * ```typescript
 * const light: ColorTokens = {
 *   primary: '#2563eb',
 *   background: '#ffffff',
 *   foreground: '#111827',
 *   border: '#e5e7eb',
 * };
 *
 * // With an extra custom token
 * const withSuccess: ColorTokens = {
 *   primary: '#2563eb',
 *   background: '#ffffff',
 *   foreground: '#111827',
 *   border: '#e5e7eb',
 *   success: '#16a34a',
 * };
 * ```
 */
export interface ColorTokens {
  /**
   * Primary brand/accent color, used for buttons, links, and highlights.
   *
   * @example
   * ```typescript
   * const primary = '#2563eb';
   * ```
   */
  primary: string;

  /**
   * Base background color for surfaces (page, cards, panels).
   *
   * @example
   * ```typescript
   * const background = '#ffffff'; // light
   * const background = '#0f172a'; // dark
   * ```
   */
  background: string;

  /**
   * Default text/foreground color, used against `background`.
   *
   * @example
   * ```typescript
   * const foreground = '#111827'; // light
   * const foreground = '#f1f5f9'; // dark
   * ```
   */
  foreground: string;

  /**
   * Default border/divider color for outlines and separators.
   *
   * @example
   * ```typescript
   * const border = '#e5e7eb'; // light
   * const border = '#334155'; // dark
   * ```
   */
  border: string;

  /**
   * Additional, consumer-defined color tokens beyond the required set.
   *
   * @remarks
   * Allows extending the palette (e.g. `success`, `warning`, `accent`)
   * without requiring changes to this interface.
   */
  [key: string]: string;
}
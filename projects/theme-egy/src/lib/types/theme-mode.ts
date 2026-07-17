/**
 * Supported theme modes.
 *
 * @remarks
 * This type is used throughout the library to determine which color
 * palette is currently active. `'light'` and `'dark'` map directly to
 * the `colors.light` and `colors.dark` objects provided in `ThemeConfig`.
 *
 * @example
 * ```typescript
 * const mode: ThemeMode = 'dark';
 * ```
 */
export type ThemeMode = 'light' | 'dark';
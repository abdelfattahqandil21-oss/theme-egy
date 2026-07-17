import { ColorTokens } from './color-tokens';
import { ColorSource } from './color-source';
import { StorageStrategy } from './storage-strategy';
import { ThemeMode } from './theme-mode';

/**
 * Configuration interface for the theme-egy library.
 *
 * @remarks
 * This configuration is passed to the `provideTheme()` function during
 * application bootstrap. It defines how colors are sourced, the default
 * mode, and optional storage/DOM-application settings.
 *
 * @example
 * ```typescript
 * // Config source (default) — colors provided in JavaScript
 * provideTheme({
 *   colors: {
 *     light: { primary: '#2563eb', ... },
 *     dark: { primary: '#3b82f6', ... },
 *   },
 * });
 *
 * // CSS source — colors read from CSS custom properties
 * provideTheme({
 *   colorSource: 'css',
 * });
 * ```
 */
export interface ThemeConfig {
  /**
   * Color palettes for the light and dark modes.
   *
   * @remarks
   * **Required** when `colorSource` is `'config'` (the default).
   * **Must not** be provided when `colorSource` is `'css'`.
   *
   * Both `light` and `dark` must be provided in full — the library does
   * not merge or fall back between them, since a mismatched pair
   * (missing colors in one mode) would silently break the theme
   * without any type-level warning.
   *
   * @example
   * ```typescript
   * colors: {
   *   light: { primary: '#2563eb', background: '#ffffff', foreground: '#111827', border: '#e5e7eb' },
   *   dark: { primary: '#3b82f6', background: '#0f172a', foreground: '#f1f5f9', border: '#334155' },
   * }
   * ```
   */
  colors?: {
    light: ColorTokens;
    dark: ColorTokens;
  };

  /**
   * Determines where the theme color palette originates.
   *
   * @remarks
   * - `'config'` (default): Colors are provided via the `colors` property.
   * - `'css'`: Colors are read from CSS custom properties on the document
   *   root (`<html>`). Variables must follow the `--theme-*` convention.
   *
   * When set to `'css'`, the `colors` property must be omitted.
   *
   * @default 'config'
   *
   * @example
   * ```typescript
   * colorSource: 'css'
   * ```
   */
  colorSource?: ColorSource;

  /**
   * The default theme mode used when no stored preference exists.
   *
   * @default 'light'
   *
   * @example
   * ```typescript
   * defaultMode: 'dark'
   * ```
   */
  defaultMode?: ThemeMode;

  /**
   * Custom key for persisting the selected theme mode.
   *
   * @remarks
   * If not provided, defaults to `'theme-egy.mode'`.
   *
   * @default 'theme-egy.mode'
   *
   * @example
   * ```typescript
   * storageKey: 'my-app-theme'
   * ```
   */
  storageKey?: string;

  /**
   * Determines where the theme mode preference is persisted.
   *
   * @remarks
   * - `'local'` (default): Uses `localStorage`, persists across sessions.
   * - `'session'`: Uses `sessionStorage`, clears when the tab closes.
   * - `'none'`: No persistence, resets to `defaultMode` on reload.
   *
   * In SSR environments, all strategies gracefully degrade to `'none'`
   * behavior since browser storage APIs are not available.
   *
   * @default 'local'
   *
   * @example
   * ```typescript
   * storageStrategy: 'session'
   * ```
   */
  storageStrategy?: StorageStrategy;

  /**
   * Whether to automatically apply the active palette as CSS custom
   * properties (and a `data-theme` attribute) on the document's root
   * `<html>` element whenever the mode changes.
   *
   * @remarks
   * When enabled (the default), each color token is written as
   * `--theme-{token}` on `document.documentElement`, e.g. `--theme-primary`,
   * and `data-theme="light" | "dark"` is set for CSS/attribute selectors.
   *
   * This setting is primarily useful in `'config'` mode, where the
   * library writes the configured values. In `'css'` mode, the library
   * reads existing CSS variables and does not write them back, so
   * `autoApply` is typically set to `false`.
   *
   * Set to `false` if your application handles DOM application itself
   * or if you want to avoid conflicting writes.
   *
   * This setting has no effect in SSR environments, where `document` is
   * unavailable and the write is skipped automatically.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // Default: library manages CSS variables automatically
   * provideTheme({ colors: { ... } });
   *
   * // Opt out: handle DOM application yourself
   * provideTheme({ colors: { ... }, autoApply: false });
   * ```
   */
  autoApply?: boolean;
}
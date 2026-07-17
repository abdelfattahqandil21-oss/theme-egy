import { StorageStrategy } from '../types/storage-strategy';
import { ThemeMode } from '../types/theme-mode';

/**
 * Default localStorage key used to persist the selected theme mode.
 *
 * @remarks
 * Used when no custom `storageKey` is provided in the `ThemeConfig`.
 * Ensures a consistent and predictable storage key across the application.
 *
 * @example
 * ```typescript
 * // Equivalent to:
 * localStorage.getItem('theme-egy.mode');
 * ```
 */
export const DEFAULT_STORAGE_KEY = 'theme-egy.mode';

/**
 * Default storage strategy for persisting the selected theme mode.
 *
 * @remarks
 * Used as a fallback when no `storageStrategy` is specified in the
 * `ThemeConfig`. Persists the mode across browser sessions and tabs
 * via `localStorage`.
 *
 * @example
 * ```typescript
 * const strategy: StorageStrategy = DEFAULT_STORAGE_STRATEGY; // 'local'
 * ```
 */
export const DEFAULT_STORAGE_STRATEGY: StorageStrategy = 'local';

/**
 * Default theme mode used when no stored preference and no
 * `defaultMode` are provided.
 *
 * @example
 * ```typescript
 * const mode: ThemeMode = DEFAULT_MODE; // 'light'
 * ```
 */
export const DEFAULT_MODE: ThemeMode = 'light';

/**
 * Default value for automatic CSS custom property / `data-theme`
 * application on the document root.
 *
 * @remarks
 * Used as a fallback when no `autoApply` is specified in the
 * `ThemeConfig`. Enabled by default so theme switching works out of
 * the box without any manual DOM wiring.
 *
 * @example
 * ```typescript
 * const auto: boolean = DEFAULT_AUTO_APPLY; // true
 * ```
 */
export const DEFAULT_AUTO_APPLY = true;

/**
 * Prefix used for CSS custom properties written to the document root.
 *
 * @remarks
 * A color token named `primary` is written as `--theme-primary`.
 * This constant is internal and not currently configurable — if a
 * real need for a custom prefix comes up, it can be added to
 * `ThemeConfig` later without a breaking change.
 *
 * @internal
 */
export const CSS_VAR_PREFIX = '--theme-';
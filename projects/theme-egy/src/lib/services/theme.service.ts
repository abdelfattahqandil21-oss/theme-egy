import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CSS_VAR_PREFIX,
  DEFAULT_AUTO_APPLY,
  DEFAULT_MODE,
  DEFAULT_STORAGE_KEY,
  DEFAULT_STORAGE_STRATEGY,
} from '../constants/defaults';
import { THEME_CONFIG } from '../tokens/theme-config.token';
import { ThemeColorProvider } from '../color-providers/theme-color-provider';
import { ConfigColorProvider } from '../color-providers/config-color-provider';
import { CssVariableColorProvider } from '../color-providers/css-variable-color-provider';
import { ColorTokens } from '../types/color-tokens';
import { ColorSource } from '../types/color-source';
import { StorageStrategy } from '../types/storage-strategy';
import { ThemeMode } from '../types/theme-mode';
import { safeGetItem, safeSetItem } from '../utils/storage';

/**
 * Core service for theme (light/dark mode + color tokens) management
 * in Angular applications.
 *
 * @remarks
 * `ThemeService` is the single source of truth for all theme-related
 * state. It uses Angular Signals internally and exposes readonly
 * signals for reactive state consumption.
 *
 * The service manages:
 * - Current theme mode (light/dark)
 * - Active color palette for the current mode
 * - Runtime palette overrides on top of the configured colors
 * - Mode persistence (configurable: localStorage, sessionStorage, or none)
 * - Automatic CSS custom property / `data-theme` sync on `<html>`
 *   (unless `autoApply: false` is set, see {@link ThemeConfig})
 *
 * ### Color Sources
 *
 * The library supports two color sources:
 *
 * - **`'config'` (default):** Colors come from `ThemeConfig.colors`.
 *   The library writes them as CSS custom properties.
 * - **`'css'`:** Colors are read from existing CSS custom properties
 *   (`--theme-*`) on `<html>`. The library does not write CSS variables.
 *
 * The active {@link ThemeColorProvider} is injected via the
 * `THEME_COLOR_PROVIDER` token, which is selected automatically by
 * {@link provideTheme} based on the `colorSource` setting.
 *
 * ### Runtime Palette Overrides
 *
 * The configured palette remains immutable. Runtime overrides are
 * layered on top using signal composition:
 *
 * ```
 * ThemeColorProvider           (reads from config or CSS)
 *     ↓
 * runtimeOverrides signal     (Partial<ColorTokens> | null)
 *     ↓
 * computed activeColors       (provider colors + overrides merged)
 * ```
 *
 * When `updateColors()` is called, only the `runtimeOverrides` signal
 * changes. In `'config'` mode, switching modes uses the configured
 * palette for the new mode with overrides re-applied. In `'css'` mode,
 * the CSS cascade handles mode switching and `updateColors()` layers
 * on top of whatever the browser computes.
 *
 * @example
 * ```typescript
 * const theme = inject(ThemeService);
 *
 * console.log(theme.mode());     // 'light'
 * console.log(theme.isDark());   // false
 * console.log(theme.colors());   // { primary: '#2563eb', ... }
 *
 * theme.setMode('dark');
 * theme.toggle();
 *
 * theme.updateColors({ primary: '#ef4444' });
 * theme.resetColors();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _config = inject(THEME_CONFIG);

  /** @internal */
  readonly _mode = signal<ThemeMode>(this._resolveInitialMode());

  private readonly _colorSource: ColorSource = this._config.colorSource ?? 'config';

  private readonly _colorProvider: ThemeColorProvider =
    this._colorSource === 'css'
      ? new CssVariableColorProvider(this._mode.asReadonly())
      : new ConfigColorProvider(this._config, this._mode.asReadonly());
  private readonly _storageKey = this._config.storageKey ?? DEFAULT_STORAGE_KEY;
  private readonly _storageStrategy: StorageStrategy =
    this._config.storageStrategy ?? DEFAULT_STORAGE_STRATEGY;
  private readonly _autoApply: boolean = this._config.autoApply ?? DEFAULT_AUTO_APPLY;

  /**
   * Base palette from the active color provider — switches reactively
   * when the mode changes.
   */
  private readonly _basePalette = this._colorProvider.colors;

  /**
   * Partial overrides applied at runtime. `null` means no overrides are active.
   * This is the only mutable state besides `_mode`.
   */
  private readonly _runtimeOverrides = signal<Partial<ColorTokens> | null>(null);

  /**
   * Merged active palette: base colors + runtime overrides.
   * Overrides take precedence over base values.
   */
  private readonly _activeColors = computed<ColorTokens>(() => {
    const base = this._basePalette();
    const overrides = this._runtimeOverrides();
    if (!overrides) {
      return base;
    }
    const merged: Record<string, string> = {};
    for (const key of Object.keys(base)) {
      merged[key] = overrides[key] ?? base[key];
    }
    for (const key of Object.keys(overrides)) {
      if (overrides[key] !== undefined && !(key in base)) {
        merged[key] = overrides[key]!;
      }
    }
    return merged as ColorTokens;
  });

  /**
   * Reactive signal of the current theme mode.
   *
   * @returns A `Signal` of `'light'` or `'dark'`.
   *
   * @example
   * ```typescript
   * const mode = theme.mode();
   * // 'light'
   * ```
   */
  readonly mode = this._mode.asReadonly();

  /**
   * Reactive signal indicating whether the current mode is dark.
   *
   * @returns A `Signal` of `boolean`. `true` if the current mode is `'dark'`.
   *
   * @example
   * ```typescript
   * const isDark = theme.isDark();
   * // false
   * ```
   */
  readonly isDark = computed<boolean>(() => this._mode() === 'dark');

  /**
   * Reactive signal of the active color palette for the current mode.
   *
   * @remarks
   * Returns the merged result of the base palette (from the active
   * color provider) and any runtime overrides set via
   * {@link updateColors}. If no overrides are active, this is identical
   * to the base palette.
   *
   * @returns A `Signal` of `ColorTokens` matching the current mode,
   * with any runtime overrides applied.
   *
   * @example
   * ```typescript
   * const colors = theme.colors();
   * console.log(colors.primary); // '#2563eb'
   * ```
   */
  readonly colors = this._activeColors;

  constructor() {
    effect(() => {
      const mode = this._mode();
      safeSetItem(this._storageKey, mode, this._storageStrategy);
    });

    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }
      document.documentElement.setAttribute('data-theme', this._mode());
    });

    if (this._colorSource === 'config') {
      effect(() => {
        if (typeof document === 'undefined') {
          return;
        }
        const tokens = this._activeColors();
        const root = document.documentElement;
        for (const [key, value] of Object.entries(tokens)) {
          root.style.setProperty(`${CSS_VAR_PREFIX}${key}`, value);
        }
      });
    }

    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }
      const overrides = this._runtimeOverrides();
      const root = document.documentElement;
      if (overrides) {
        for (const [key, value] of Object.entries(overrides)) {
          if (value !== undefined) {
            root.style.setProperty(`${CSS_VAR_PREFIX}${key}`, value);
          }
        }
      } else {
        // Remove inline overrides so CSS cascade takes over
        const allTokens = this._colorProvider.colors();
        for (const key of Object.keys(allTokens)) {
          root.style.removeProperty(`${CSS_VAR_PREFIX}${key}`);
        }
      }
    });
  }

  /**
   * Sets the active theme mode explicitly.
   *
   * @param mode - The theme mode to activate (`'light'` or `'dark'`).
   *
   * @remarks
   * The change is automatically persisted according to the configured
   * storage strategy, and the DOM is updated automatically unless
   * `autoApply` was set to `false`.
   *
   * @example
   * ```typescript
   * theme.setMode('dark');
   * console.log(theme.mode()); // 'dark'
   * ```
   */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  /**
   * Toggles between light and dark mode.
   *
   * @example
   * ```typescript
   * // Current: 'light'
   * theme.toggle();
   * // Current: 'dark'
   *
   * theme.toggle();
   * // Current: 'light'
   * ```
   */
  toggle(): void {
    this._mode.set(this._mode() === 'light' ? 'dark' : 'light');
  }

  /**
   * Applies runtime color overrides on top of the base palette.
   *
   * @param colors - A partial set of color tokens to override. Only the
   * provided tokens are changed; all other tokens keep their current
   * values from the base palette.
   *
   * @remarks
   * This method updates an internal override signal that is merged with
   * the base palette. The merge follows a simple rule:
   *
   * ```
   * active = { ...base, ...runtimeOverrides }
   * ```
   *
   * The override is **mode-aware**: switching modes will use the base
   * palette for the new mode, with the same overrides re-applied on top.
   *
   * To remove all overrides and restore the base palette, call
   * {@link resetColors}.
   *
   * @example
   * ```typescript
   * // Override the primary color
   * theme.updateColors({ primary: '#ef4444' });
   *
   * // Override multiple tokens
   * theme.updateColors({
   *   primary: '#06b6d4',
   *   success: '#22c55e',
   * });
   * ```
   */
  updateColors(colors: Partial<ColorTokens>): void {
    const current = this._runtimeOverrides();
    this._runtimeOverrides.set(current ? { ...current, ...colors } : colors);
  }

  /**
   * Removes all runtime color overrides and restores the base palette.
   *
   * @remarks
   * This is an alias for {@link clearRuntimeColors} provided for
   * readability. After calling this method, `colors()` returns the
   * base palette from the active color provider.
   *
   * @example
   * ```typescript
   * theme.updateColors({ primary: '#ef4444' });
   * theme.resetColors();
   * // colors() returns the base palette
   * ```
   */
  resetColors(): void {
    this._runtimeOverrides.set(null);
  }

  /**
   * Removes all runtime color overrides and restores the base palette.
   *
   * @remarks
   * Identical in behavior to {@link resetColors}. Both names are
   * provided for API discoverability.
   *
   * @example
   * ```typescript
   * theme.updateColors({ primary: '#ef4444' });
   * theme.clearRuntimeColors();
   * // colors() returns the base palette
   * ```
   */
  clearRuntimeColors(): void {
    this._runtimeOverrides.set(null);
  }

  /**
   * Forces the CSS variable color provider to re-read variables.
   *
   * @remarks
   * In `'css'` mode, this is useful after dynamically injecting new
   * `--theme-*` variables into the DOM. In `'config'` mode, this is
   * a no-op.
   */
  refreshColors(): void {
    if (this._colorProvider instanceof CssVariableColorProvider) {
      this._colorProvider.refresh();
    }
  }

  private _resolveInitialMode(): ThemeMode {
    const stored = safeGetItem(this._storageKey, this._storageStrategy);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return this._config.defaultMode ?? DEFAULT_MODE;
  }
}
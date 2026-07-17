import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CSS_VAR_PREFIX,
  DEFAULT_AUTO_APPLY,
  DEFAULT_MODE,
  DEFAULT_STORAGE_KEY,
  DEFAULT_STORAGE_STRATEGY,
} from '../constants/defaults';
import { THEME_CONFIG } from '../tokens/theme-config.token';
import { ColorTokens } from '../types/color-tokens';
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
 * - Mode persistence (configurable: localStorage, sessionStorage, or none)
 * - Automatic CSS custom property / `data-theme` sync on `<html>`
 *   (unless `autoApply: false` is set, see {@link ThemeConfig})
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
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _config = inject(THEME_CONFIG);
  private readonly _storageKey = this._config.storageKey ?? DEFAULT_STORAGE_KEY;
  private readonly _storageStrategy: StorageStrategy =
    this._config.storageStrategy ?? DEFAULT_STORAGE_STRATEGY;
  private readonly _autoApply: boolean = this._config.autoApply ?? DEFAULT_AUTO_APPLY;

  private readonly _mode = signal<ThemeMode>(this._resolveInitialMode());

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
   * @returns A `Signal` of `ColorTokens` matching the current mode.
   *
   * @example
   * ```typescript
   * const colors = theme.colors();
   * console.log(colors.primary); // '#2563eb'
   * ```
   */
  readonly colors = computed<ColorTokens>(() =>
    this._mode() === 'dark' ? this._config.colors.dark : this._config.colors.light,
  );

  constructor() {
    if (!this._config.colors?.light || !this._config.colors?.dark) {
      throw new Error(
        '[theme-egy] Both colors.light and colors.dark must be provided in ThemeConfig.',
      );
    }

    effect(() => {
      const mode = this._mode();
      safeSetItem(this._storageKey, mode, this._storageStrategy);
    });

    if (this._autoApply) {
      effect(() => {
        if (typeof document === 'undefined') {
          return;
        }
        const root = document.documentElement;
        const tokens = this.colors();
        for (const [key, value] of Object.entries(tokens)) {
          root.style.setProperty(`${CSS_VAR_PREFIX}${key}`, value);
        }
        root.setAttribute('data-theme', this._mode());
      });
    }
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

  private _resolveInitialMode(): ThemeMode {
    const stored = safeGetItem(this._storageKey, this._storageStrategy);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return this._config.defaultMode ?? DEFAULT_MODE;
  }
}
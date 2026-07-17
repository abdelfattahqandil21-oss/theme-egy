import { Signal, computed, signal } from '@angular/core';
import { ColorTokens } from '../types/color-tokens';
import { ThemeMode } from '../types/theme-mode';
import { ThemeColorProvider } from './theme-color-provider';
import { CSS_VAR_PREFIX } from '../constants/defaults';

/**
 * Default fallback colors used when the DOM is not available (SSR).
 */
const SSR_FALLBACK_COLORS: ColorTokens = {
  primary: '#000000',
  background: '#ffffff',
  foreground: '#000000',
  border: '#cccccc',
};

/**
 * Reads colors from CSS custom properties on `document.documentElement`.
 *
 * @remarks
 * This provider reads `--theme-*` variables from the computed styles of
 * the document root. It is designed for workflows where colors are
 * defined entirely in CSS — Tailwind CSS v4 `@theme`, CSS Design Tokens,
 * or plain CSS custom properties.
 *
 * CSS example:
 * ```css
 * :root {
 *   --theme-primary: #3b82f6;
 *   --theme-background: #ffffff;
 *   --theme-foreground: #111827;
 *   --theme-border: #e5e7eb;
 * }
 * .dark {
 *   --theme-primary: #60a5fa;
 *   --theme-background: #0f172a;
 *   --theme-foreground: #f1f5f9;
 *   --theme-border: #334155;
 * }
 * ```
 *
 * Mode changes are handled by the CSS cascade (.dark class or
 * `[data-theme="dark"]` selector). The provider re-reads variables
 * whenever the mode signal changes.
 *
 * ### Known tokens
 *
 * The provider reads the four required tokens (`primary`, `background`,
 * `foreground`, `border`) and dynamically discovers any additional
 * `--theme-*` variables present in the computed style. This means
 * custom tokens like `--theme-success`, `--theme-warning` are picked
 * up automatically.
 *
 * ### SSR safety
 *
 * When `document` is not available (SSR), the provider returns a set of
 * neutral fallback colors so the application does not crash.
 *
 * ### Performance
 *
 * Values are cached in a signal and only re-read when the mode signal
 * changes or `refresh()` is called.
 */
export class CssVariableColorProvider extends ThemeColorProvider {
  private readonly _cache = signal<ColorTokens | null>(null);
  private readonly _refreshToken = signal(0);

  readonly colors: Signal<ColorTokens>;

  constructor(mode: Signal<ThemeMode>) {
    super();
    this.colors = computed(() => {
      // React to mode and manual refresh requests
      mode();
      this._refreshToken();
      return this._readVariables();
    });
  }

  /**
   * Forces a re-read of all CSS variables on the next `colors()` access.
   *
   * @remarks
   * Useful after dynamically injecting new `--theme-*` variables
   * into the DOM at runtime.
   */
  refresh(): void {
    this._refreshToken.update((n) => n + 1);
  }

  private _readVariables(): ColorTokens {
    if (typeof document === 'undefined') {
      return { ...SSR_FALLBACK_COLORS };
    }

    const style = getComputedStyle(document.documentElement);
    const tokens: Record<string, string> = {};

    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      if (prop.startsWith(CSS_VAR_PREFIX)) {
        const name = prop.slice(CSS_VAR_PREFIX.length);
        const value = style.getPropertyValue(prop).trim();
        if (value) {
          tokens[name] = value;
        }
      }
    }

    // Ensure required tokens exist even if CSS is incomplete
    if (!tokens['primary']) tokens['primary'] = SSR_FALLBACK_COLORS.primary;
    if (!tokens['background']) tokens['background'] = SSR_FALLBACK_COLORS.background;
    if (!tokens['foreground']) tokens['foreground'] = SSR_FALLBACK_COLORS.foreground;
    if (!tokens['border']) tokens['border'] = SSR_FALLBACK_COLORS.border;

    return tokens as ColorTokens;
  }
}

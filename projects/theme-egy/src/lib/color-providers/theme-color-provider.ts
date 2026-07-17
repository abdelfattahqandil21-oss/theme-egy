import { Signal } from '@angular/core';
import { ColorTokens } from '../types/color-tokens';
import { ThemeMode } from '../types/theme-mode';

/**
 * Abstract provider for theme color palettes.
 *
 * @remarks
 * `ThemeService` depends on this abstraction rather than reading
 * `ThemeConfig` directly. This allows the library to support multiple
 * color sources — currently `'config'` (the original behavior) and
 * `'css'` (reading from CSS custom properties) — without coupling
 * the service to any particular strategy.
 *
 * Implementations must:
 * - Return a valid `ColorTokens` object for any {@link ThemeMode}.
 * - Handle SSR gracefully (return fallback colors when DOM is not
 *   available).
 * - Be reactive via the `colors` signal so that `ThemeService` can
 *   depend on it in effects and computed signals.
 *
 * The `mode` signal is provided so the implementation can react to
 * mode changes (e.g. switch between light/dark CSS variable values).
 */
export abstract class ThemeColorProvider {
  /**
   * Reactive signal of the active color palette for the given mode.
   *
   * @returns An `InputSignal` or `Signal` of `ColorTokens` that
   * automatically updates when the mode changes.
   */
  abstract readonly colors: Signal<ColorTokens>;
}

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { THEME_CONFIG } from '../tokens/theme-config.token';
import { ThemeConfig } from '../types/theme-config';
import { ColorSource } from '../types/color-source';

const DEFAULT_COLOR_SOURCE: ColorSource = 'config';

/**
 * Configures the theme-egy library for the entire application.
 *
 * @param config - The theme configuration object.
 * @returns An `EnvironmentProviders` instance to be provided in the application.
 *
 * @remarks
 * This function must be called during application bootstrap to initialize
 * the theming system. It registers the configuration token and validates
 * the config based on the chosen color source.
 *
 * The `ThemeService` handles color provider selection internally based on
 * `config.colorSource`, avoiding circular DI dependencies.
 *
 * ### Color sources
 *
 * - **`'config'` (default):** Colors are provided via the `colors` property.
 *   The library writes them as CSS custom properties on `<html>`.
 *
 * - **`'css'`:** Colors are read from existing CSS custom properties
 *   (`--theme-*`) on `<html>`. The library does not write CSS variables.
 *   Designed for Tailwind CSS v4, CSS Design Tokens, etc.
 *
 * @example
 * ```typescript
 * // Config source (default)
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideTheme({
 *       colors: {
 *         light: {
 *           primary: '#2563eb',
 *           background: '#ffffff',
 *           foreground: '#111827',
 *           border: '#e5e7eb',
 *         },
 *         dark: {
 *           primary: '#3b82f6',
 *           background: '#0f172a',
 *           foreground: '#f1f5f9',
 *           border: '#334155',
 *         },
 *       },
 *     }),
 *   ],
 * });
 *
 * // CSS source (Tailwind, CSS tokens)
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideTheme({
 *       colorSource: 'css',
 *     }),
 *   ],
 * });
 * ```
 */
export function provideTheme(config: ThemeConfig): EnvironmentProviders {
  const colorSource = config.colorSource ?? DEFAULT_COLOR_SOURCE;

  if (colorSource === 'css') {
    if (config.colors) {
      throw new Error(
        '[theme-egy] When colorSource is "css", the "colors" property must not be provided. ' +
        'Define colors via CSS custom properties (--theme-*) on :root and .dark selectors.',
      );
    }
    return makeEnvironmentProviders([{ provide: THEME_CONFIG, useValue: config }]);
  }

  if (!config.colors?.light || !config.colors?.dark) {
    throw new Error(
      '[theme-egy] When colorSource is "config" (default), both colors.light and colors.dark must be provided.',
    );
  }

  return makeEnvironmentProviders([{ provide: THEME_CONFIG, useValue: config }]);
}
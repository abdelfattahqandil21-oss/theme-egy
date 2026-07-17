import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { THEME_CONFIG } from '../tokens/theme-config.token';
import { ThemeConfig } from '../types/theme-config';

/**
 * Configures the theme-egy library for the entire application.
 *
 * @param config - The theme configuration object.
 * @returns An `EnvironmentProviders` instance to be provided in the application.
 *
 * @remarks
 * This function must be called during application bootstrap to initialize
 * the theming system. It registers the configuration token and makes the
 * `ThemeService` available throughout the application.
 *
 * @example
 * ```typescript
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
 *       defaultMode: 'light',
 *     }),
 *   ],
 * });
 * ```
 */
export function provideTheme(config: ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: THEME_CONFIG, useValue: config }]);
}
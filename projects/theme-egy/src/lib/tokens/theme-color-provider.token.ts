import { InjectionToken } from '@angular/core';
import { ThemeColorProvider } from '../color-providers/theme-color-provider';

/**
 * Internal InjectionToken for the active color provider.
 *
 * @remarks
 * This token allows `ThemeService` to depend on the abstract
 * `ThemeColorProvider` interface without knowing which concrete
 * implementation is in use (`ConfigColorProvider` or
 * `CssVariableColorProvider`).
 *
 * @internal
 */
export const THEME_COLOR_PROVIDER = new InjectionToken<ThemeColorProvider>(
  'THEME_COLOR_PROVIDER',
);

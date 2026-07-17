import { InjectionToken } from '@angular/core';
import { ThemeConfig } from '../types/theme-config';

/**
 * Internal InjectionToken for the theme configuration.
 *
 * @remarks
 * This token is used internally by the library to provide the
 * configuration to the `ThemeService`. Library consumers should
 * NOT use this token directly. Instead, use the `provideTheme()`
 * function to configure the library.
 *
 * @internal
 */
export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');
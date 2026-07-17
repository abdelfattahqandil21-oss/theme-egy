/*
 * Public API Surface of theme-egy
 */

export type { ThemeMode } from './lib/types/theme-mode';
export type { ColorTokens } from './lib/types/color-tokens';
export type { ThemeConfig } from './lib/types/theme-config';
export type { ColorSource } from './lib/types/color-source';
export type { StorageStrategy } from './lib/types/storage-strategy';
export type { ThemeColorProvider } from './lib/color-providers/theme-color-provider';
export { provideTheme } from './lib/providers/provide-theme';
export { injectTheme } from './lib/inject/inject-theme';
export { ThemeService } from './lib/services/theme.service';
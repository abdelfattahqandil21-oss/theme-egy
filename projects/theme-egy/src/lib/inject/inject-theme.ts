import { inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

/**
 * Convenience shorthand for `inject(ThemeService)`.
 *
 * @returns The application-wide {@link ThemeService} instance.
 *
 * @example
 * ```typescript
 * const theme = injectTheme();
 *
 * effect(() => console.log(theme.mode()));
 * ```
 */
export function injectTheme() {
  return inject(ThemeService);
}
import { Signal, computed } from '@angular/core';
import { ThemeConfig } from '../types/theme-config';
import { ColorTokens } from '../types/color-tokens';
import { ThemeMode } from '../types/theme-mode';
import { ThemeColorProvider } from './theme-color-provider';

/**
 * Reads the color palette from the `ThemeConfig` object.
 *
 * @remarks
 * This is the default provider and replicates the original behavior
 * exactly: the palette for the current mode comes from
 * `config.colors.light` or `config.colors.dark`.
 *
 * The `ThemeConfig` object is never mutated.
 *
 * SSR safety is inherent — no DOM access is needed.
 */
export class ConfigColorProvider extends ThemeColorProvider {
  readonly colors: Signal<ColorTokens>;

  constructor(
    config: ThemeConfig,
    mode: Signal<ThemeMode>,
  ) {
    super();
    this.colors = computed(() =>
      mode() === 'dark' ? config.colors!.dark : config.colors!.light,
    );
  }
}

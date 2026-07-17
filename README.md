# theme-egy

[![npm version](https://img.shields.io/npm/v/theme-egy.svg)](https://www.npmjs.com/package/theme-egy)
[![license](https://img.shields.io/npm/l/theme-egy.svg)](https://github.com/abdelfattahqandil21-oss/theme-egy/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/theme-egy)](https://bundlephobia.com/package/theme-egy)

Modern Angular theme management library powered by Signals. Lightweight, fully tree-shakable, SSR safe.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

**theme-egy** is a lightweight, production-ready Angular library for managing light/dark themes. Built from the ground up with Angular 20+ Signals, it provides reactive theme state, automatic CSS custom property injection, and configurable persistence.

Unlike heavier theming solutions, theme-egy focuses on the foundation: mode state, color tokens, and DOM syncing. No component wrappers, no external CSS — just a clean, composable API that works with Angular's modern primitives.

---

## Features

| Feature | Description |
|---|---|---|
| **Signals-based** | Built on Angular Signals. Reactive, composable, performant. |
| **Two color sources** | Configure colors in JS (`'config'`) or read from CSS variables (`'css'`). |
| **CSS custom properties** | Automatically writes `--theme-*` variables on `:root` (config mode). |
| **Tree-shakable** | Only the code you use is included in your bundle. |
| **SSR safe** | Works in server-side rendering without errors. |
| **Lightweight** | Only `@angular/core` as a peer dependency. Minimal footprint. |
| **Configurable storage** | `localStorage`, `sessionStorage`, or no persistence. |
| **Auto-apply mode** | Writes both CSS variables and `data-theme` attribute on `<html>`. |
| **Extensible tokens** | Add custom color tokens (e.g. `success`, `warning`) via index signature. |
| **Runtime overrides** | Update colors at runtime without mutating the config. |
| **Standalone** | Works with standalone components and modern Angular APIs. |

---

## Requirements

| Requirement | Version |
|---|---|
| Angular | `>= 20.0.0` |
| TypeScript | `>= 5.9.0` |
| Node.js | `>= 18.0.0` |

---

## Installation

```bash
npm install theme-egy
```

or with pnpm:

```bash
pnpm add theme-egy
```

---

## Quick Start

### 1. Configure the library

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTheme } from 'theme-egy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTheme({
      colors: {
        light: {
          primary: '#2563eb',
          background: '#ffffff',
          foreground: '#111827',
          border: '#e5e7eb',
        },
        dark: {
          primary: '#3b82f6',
          background: '#0f172a',
          foreground: '#f1f5f9',
          border: '#334155',
        },
      },
    }),
  ],
};
```

### 2. Inject and use the service

```typescript
import { Component } from '@angular/core';
import { injectTheme } from 'theme-egy';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <p>Current mode: {{ theme.mode() }}</p>
    <p>Is dark: {{ theme.isDark() }}</p>
    <p>Primary color: {{ theme.colors().primary }}</p>
    <button (click)="theme.toggle()">Toggle Theme</button>
  `,
})
export class AppComponent {
  theme = injectTheme();
}
```

The library automatically sets CSS custom properties (e.g. `--theme-primary`, `--theme-background`) on `document.documentElement` and adds a `data-theme` attribute:

```css
/* styles.css */
body {
  background: var(--theme-background);
  color: var(--theme-foreground);
}

button {
  background: var(--theme-primary);
  color: #ffffff;
  border: 1px solid var(--theme-border);
}

/* Target specific mode with attribute selector */
[data-theme="dark"] .card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

---

## Configuration

### `ThemeConfig`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `colorSource` | `'config' \| 'css'` | No | `'config'` | Where colors originate. `'config'`: from the `colors` property. `'css'`: from CSS custom properties |
| `colors.light` | `ColorTokens` | When `colorSource` is `'config'` | -- | Color palette for light mode |
| `colors.dark` | `ColorTokens` | When `colorSource` is `'config'` | -- | Color palette for dark mode |
| `defaultMode` | `'light' \| 'dark'` | No | `'light'` | Default mode when no stored preference exists |
| `storageKey` | `string` | No | `'theme-egy.mode'` | Key used for persistence |
| `storageStrategy` | `'local' \| 'session' \| 'none'` | No | `'local'` | Where to persist the theme mode |
| `autoApply` | `boolean` | No | `true` | Automatically write CSS variables and `data-theme` on `<html>` |

### `ColorTokens`

| Property | Type | Description |
|---|---|---|
| `primary` | `string` | Primary brand/accent color (buttons, links, highlights) |
| `background` | `string` | Base background color for surfaces |
| `foreground` | `string` | Default text/foreground color |
| `border` | `string` | Default border/divider color |
| `[key: string]` | `string` | Additional custom tokens (e.g. `success`, `warning`) |

### Storage Strategies

| Strategy | Storage | Behavior |
|---|---|---|
| `'local'` | `localStorage` | Persists across browser sessions and tabs. **(default)** |
| `'session'` | `sessionStorage` | Persists within the current tab only. Resets when tab closes. |
| `'none'` | Nothing | No persistence. Resets to `defaultMode` on every page reload. |

In SSR environments, all strategies gracefully degrade to no-op.

### CSS Source Mode

When `colorSource: 'css'`, the library reads colors from CSS custom properties on `<html>` instead of from the `colors` config property. This is designed for:

- **Tailwind CSS v4** — define colors via `@theme` and let CSS cascade handle dark/light
- **CSS Design Tokens** — single source of truth in CSS
- **Any workflow** where colors are already defined in CSS

The library expects `--theme-*` variables:

```css
:root {
  --theme-primary: #3b82f6;
  --theme-background: #ffffff;
  --theme-foreground: #111827;
  --theme-border: #e5e7eb;
  --theme-success: #22c55e;
}

.dark {
  --theme-primary: #60a5fa;
  --theme-background: #0f172a;
  --theme-foreground: #f1f5f9;
  --theme-border: #334155;
  --theme-success: #4ade80;
}
```

With Tailwind v4:

```css
@import "tailwindcss";

@theme {
  --theme-primary: #3b82f6;
  --theme-background: #ffffff;
  --theme-foreground: #111827;
  --theme-border: #e5e7eb;
}

.dark {
  --theme-primary: #60a5fa;
  --theme-background: #0f172a;
  --theme-foreground: #f1f5f9;
  --theme-border: #334155;
}
```

Configure with:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideTheme } from 'theme-egy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTheme({
      colorSource: 'css',
      // No 'colors' property needed.
      // Set autoApply to false since CSS already defines the values.
      autoApply: false,
    }),
  ],
};
```

The library still provides `theme.colors()` — it reads the current computed CSS variables.

### Full configuration example (config mode)

```typescript
provideTheme({
  defaultMode: 'dark',
  storageKey: 'my-app-theme',
  storageStrategy: 'session',
  autoApply: true,
  colors: {
    light: {
      primary: '#2563eb',
      background: '#ffffff',
      foreground: '#111827',
      border: '#e5e7eb',
      success: '#16a34a',
      warning: '#d97706',
    },
    dark: {
      primary: '#3b82f6',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
      success: '#22c55e',
      warning: '#f59e0b',
    },
  },
});
```

---

## Migration to CSS Source

### From config mode to CSS mode

If you're currently using `colors` in provideTheme and want to move to CSS-defined colors:

**Before:**

```typescript
provideTheme({
  colors: {
    light: { primary: '#2563eb', background: '#ffffff', foreground: '#111827', border: '#e5e7eb' },
    dark: { primary: '#3b82f6', background: '#0f172a', foreground: '#f1f5f9', border: '#334155' },
  },
});
```

```css
/* styles.css */
body {
  background: var(--theme-background);
  color: var(--theme-foreground);
}
```

**After:**

```css
/* styles.css — all colors defined here */
:root {
  --theme-primary: #2563eb;
  --theme-background: #ffffff;
  --theme-foreground: #111827;
  --theme-border: #e5e7eb;
}

.dark {
  --theme-primary: #3b82f6;
  --theme-background: #0f172a;
  --theme-foreground: #f1f5f9;
  --theme-border: #334155;
}

body {
  background: var(--theme-background);
  color: var(--theme-foreground);
}
```

```typescript
import { provideTheme } from 'theme-egy';

provideTheme({
  colorSource: 'css',
  autoApply: false,
});
```

The `data-theme` attribute continues to be set on `<html>` by default. You can use it in your CSS:

```css
[data-theme="dark"] .card {
  background: var(--theme-background);
}
```

### Complete: Tailwind v4 + theme-egy

```css
/* styles.css */
@import "tailwindcss";

@theme {
  --theme-primary: #3b82f6;
  --theme-background: #ffffff;
  --theme-foreground: #111827;
  --theme-border: #e5e7eb;
}

.dark {
  --theme-primary: #60a5fa;
  --theme-background: #0f172a;
  --theme-foreground: #f1f5f9;
  --theme-border: #334155;
}
```

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTheme } from 'theme-egy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTheme({
      colorSource: 'css',
      autoApply: false,
    }),
  ],
};
```

No duplication. Colors are defined once in CSS. The library handles mode persistence and theming state.

---

## API Reference

### `provideTheme(config)`

Configures the theme system. Call this during application bootstrap.

```typescript
function provideTheme(config: ThemeConfig): EnvironmentProviders;
```

### `injectTheme()`

Convenience function to inject the `ThemeService`. Use this instead of `inject(ThemeService)` for cleaner imports.

```typescript
function injectTheme(): ThemeService;
```

```typescript
import { injectTheme } from 'theme-egy';

@Component({ ... })
export class MyComponent {
  theme = injectTheme();
}
```

### `ThemeService`

The core service providing all theme state and operations. Inject via `injectTheme()` or `inject(ThemeService)`.

#### Signals (readonly)

| Signal | Type | Description |
|---|---|---|
| `mode()` | `'light' \| 'dark'` | Current theme mode |
| `isDark()` | `boolean` | Whether current mode is dark |
| `colors()` | `ColorTokens` | Active color palette for the current mode |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `setMode(mode)` | `(mode: ThemeMode) => void` | Switch to a specific theme mode |
| `toggle()` | `() => void` | Toggle between light and dark |
| `updateColors(colors)` | `(colors: Partial<ColorTokens>) => void` | Apply runtime color overrides on top of the base palette |
| `resetColors()` | `() => void` | Remove all runtime overrides and restore the base palette |
| `clearRuntimeColors()` | `() => void` | Alias for `resetColors()` |
| `refreshColors()` | `() => void` | Force re-read of CSS variables (relevant in `'css'` mode) |

---

## Examples

### Dark mode toggle button

```typescript
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button (click)="theme.toggle()">
      {{ theme.isDark() ? '☀️ Light Mode' : '🌙 Dark Mode' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  theme = injectTheme();
}
```

### Using signals in templates

```typescript
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header [class.dark]="theme.isDark()">
      <span>My App</span>
      <button (click)="theme.toggle()">
        {{ theme.mode() === 'light' ? 'Dark' : 'Light' }}
      </button>
    </header>
  `,
})
export class HeaderComponent {
  theme = injectTheme();
}
```

### Custom color tokens

```typescript
provideTheme({
  colors: {
    light: {
      primary: '#2563eb',
      background: '#ffffff',
      foreground: '#111827',
      border: '#e5e7eb',
      success: '#16a34a',
      error: '#dc2626',
      accent: '#8b5cf6',
    },
    dark: {
      primary: '#3b82f6',
      background: '#0f172a',
      foreground: '#f1f5f9',
      border: '#334155',
      success: '#22c55e',
      error: '#ef4444',
      accent: '#a78bfa',
    },
  },
});
```

```css
.success-text {
  color: var(--theme-success);
}

.error-bg {
  background: var(--theme-error);
}

.accent-border {
  border-color: var(--theme-accent);
}
```

### Manual CSS variable application

If you prefer to handle the DOM yourself, disable `autoApply` and use the `colors()` signal:

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`,
})
export class AppComponent {
  theme = injectTheme();

  constructor() {
    // Apply variables manually
    effect(() => {
      const root = document.documentElement;
      const tokens = this.theme.colors();
      for (const [key, value] of Object.entries(tokens)) {
        root.style.setProperty(`--app-${key}`, value);
      }
      root.setAttribute('data-mode', this.theme.mode());
    });
  }
}
```

### SSR-safe mode detection

```typescript
import { effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({ ... })
export class AppComponent {
  theme = injectTheme();
  platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        console.log('Theme changed to:', this.theme.mode());
      }
    });
  }
}
```

---

## FAQ

### What is the difference between `'config'` and `'css'` color sources?

- **`'config'`** (default): Colors are provided in JavaScript via `provideTheme({ colors: {...} })`. The library writes them as CSS custom properties and a `data-theme` attribute. Best for apps that want a single JS configuration for their theme.
- **`'css'`**: Colors are read from existing CSS custom properties on `<html>`. The library does not write CSS variables — it reads them. Best for apps using Tailwind CSS v4, CSS Design Tokens, or any workflow with colors already in CSS.

### Can I use both `colors` and `colorSource: 'css'`?

No. When `colorSource` is `'css'`, the `colors` property must be omitted. The library will throw an error if both are provided.

### How does `updateColors()` work with `'css'` mode?

In `'css'` mode, `updateColors()` layers overrides on top of whatever the browser computes. The CSS cascade still handles mode switching, but your runtime overrides take precedence.

### Does this include pre-built CSS themes?

No. theme-egy focuses on reactive state management and automatic CSS variable injection. You define your own color values and CSS — the library provides the reactive plumbing.

### Does it work with SSR?

Yes. All storage operations and DOM writes are SSR-safe and will silently no-op in non-browser environments.

### Can I use it with NgModules?

Yes. `provideTheme()` returns `EnvironmentProviders` which works with both standalone and module-based applications.

### How is theme persistence handled?

The selected mode is persisted based on the configured `storageStrategy`:
- `'local'` (default): Uses `localStorage`. Persists across sessions.
- `'session'`: Uses `sessionStorage`. Persists within the tab.
- `'none'`: No persistence. Resets on reload.

### Can I add custom color tokens beyond the required ones?

Yes. `ColorTokens` has an index signature (`[key: string]: string`), so you can add any tokens you need (e.g. `success`, `warning`, `error`, `accent`).

### What CSS custom properties are created?

Each color token is written as `--theme-{tokenName}`. For example:
- `--theme-primary`
- `--theme-background`
- `--theme-foreground`
- `--theme-border`
- `--theme-success` (if defined)

The prefix can be customized by setting your own via `autoApply: false` and applying manually.

### Can I listen for mode changes?

Use the reactive signals (`mode()`, `isDark()`, `colors()`) with `effect()` or `computed()`.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository from [GitHub](https://github.com/abdelfattahqandil21-oss/theme-egy)
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- All tests pass
- New features include documentation
- Commit messages are clear and descriptive

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

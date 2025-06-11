# Brand Guidelines

## 1. Purpose

This document defines **design‑system primitives** (colors, typography, spacing) that both designers and engineers can consume from a single source of truth.

## 2. Color Palette

| Token                             | OKLCH                     | Intended Use                        |
| --------------------------------- | ------------------------- | ----------------------------------- |
| `color.background`                | oklch(1 0 0)              | App canvas                          |
| `color.foreground`                | oklch(0.145 0 0)          | Default text                        |
| `color.primary`                   | oklch(0.205 0 0)          | Interactive elements, brand accents |
| `color.primary‑foreground`        | oklch(0.985 0 0)          | Text/icon on primary                |
| `color.secondary`                 | oklch(0.97 0 0)           | Subtle surfaces / hovers            |
| `color.secondary‑foreground`      | oklch(0.205 0 0)          | Text/icon on secondary              |
| `color.accent`                    | oklch(0.97 0 0)           | Info highlights                     |
| `color.accent‑foreground`         | oklch(0.205 0 0)          | Text on accent                      |
| `color.destructive`               | oklch(0.577 0.245 27.325) | Errors / dangerous actions          |
| `color.border`                    | oklch(0.922 0 0)          | Input & card borders                |
| `color.chart‑1` – `color.chart‑5` | see tokens                | Data‑viz categorical colors         |

> **Accessibility**: All text should meet **WCAG 2.2 AA** contrast (≥ 4.5:1) against its background.

## 3. Typography

| Token       | Font stack                           | Weight(s)       |
| ----------- | ------------------------------------ | --------------- |
| `font.sans` | Geist Sans, system‑ui, sans-serif    | 400 / 600 / 700 |
| `font.mono` | Geist Mono, SFMono, Menlo, monospace | 400 / 600       |

### Scale

```
font-size‑token   px   rem   Usage
--------------   ---  ----  -------------------
font.display‑xl   48   3.0   Hero headlines
font.heading‑lg   32   2.0   Section headings
font.body         16   1.0   Paragraph text
font.caption      12   0.75  Supplemental text
```

## 4. Design Tokens (JSON excerpt)

```json
{
  "$schema": "https://tr.designtokens.org/format/schema.json",
  "props": {
    "color": {
      "background": { "value": "oklch(1 0 0)", "type": "color" },
      "foreground": { "value": "oklch(0.145 0 0)", "type": "color" },
      "primary": { "value": "oklch(0.205 0 0)", "type": "color" },
      "primary-foreground": { "value": "oklch(0.985 0 0)", "type": "color" },
      "secondary": { "value": "oklch(0.97 0 0)", "type": "color" },
      "secondary-foreground": { "value": "oklch(0.205 0 0)", "type": "color" }
    },
    "fontFamily": {
      "sans": { "value": "var(--font-geist-sans), system-ui, sans-serif" },
      "mono": { "value": "var(--font-geist-mono), monospace" }
    }
  }
}
```

> Run **Style Dictionary** or a similar tool in CI to generate platform-specific artifacts (CSS variables, iOS tokens, etc.).

## 5. Logo & Asset Usage

- Store SVGs in `branding/assets/`.
- Maintain **clear‑space** equal to the height of the “W” around the logo.
- Do not recolor or distort.

## 6. Voice & Tone

1. **Human, not hype.**
2. **Precise over ambiguous.**
3. **Empowering, not prescriptive.**

## 7. Contribution Workflow

1. Update tokens in `/branding/tokens/`.
2. Run `pnpm run tokens:build` to regenerate CSS.
3. Commit with `chore(tokens): describe change`.
4. Pull Request auto‑deploys docs to GitHub Pages.


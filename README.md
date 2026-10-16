# Plinth

A no-build UI kit for building tight, professional, responsive, accessible, fast client apps (SaaS, enterprise, internal tools).
Plain CSS plus one optional ~15 KB script. No framework, no npm, no bundler, no Python needed to build an app.

Borrowed on purpose: the **colour-token contract and 5 themes from [daisyUI](https://daisyui.com) 5** (MIT) and the icons from **[Lucide](https://lucide.dev)** (ISC). Licences are in `LICENSES/`.
Built for agents as much as people: see `AGENTS.md`.

```
plinth/
  plinth.css          the kit (do not edit per client)
  plinth.js           optional behaviour via data-attributes (overlays, tabs, filters, tables, wizard…)
  themes/NAME.css    one file per theme (10: 5 Plinth + 5 daisyUI, all contrast-checked), each with light AND dark; link exactly one
  themes.css         all 10 in one file (used by preview.html and the gallery)
  theme.example.css  copy to theme.css: the one file you edit per client
  icons.svg          Lucide sprite, 320+ icons (generated: python3 tools/icons.py build)
  pages/             17 page templates + _overlays.html (modals, drawers, menus) + docs, themes, icons, roadmap
  starter.html       minimal working app shell
  preview.html       the whole kit in one file: every page, theme, icon, dark mode, corners, density, shells
  AGENTS.md  llms.txt  llms-full.txt  SKILL.md  components.json  icons.json  themes.json   for AI agents (any agent)
  CLAUDE.md  .cursor/  .github/  AGENTS.snippet.md   pointers so every tool finds the rules
  index.html  _headers   landing page + CORS for hosting
  tools/             OPTIONAL Python for maintaining the kit: icons.py · themes.py · check.py (build.py regenerates preview.html + llms-full.txt)
```

## Quick start

```html
<!doctype html>
<html lang="en" data-theme="pine">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="plinth.css">
  <link rel="stylesheet" href="themes/pine.css">   <!-- ONE theme file: light + dark -->
  <link rel="stylesheet" href="theme.css">         <!-- optional: this client's own colours -->
  <script src="plinth.js" data-sprite="icons.svg" defer></script>   <!-- injects the icon sprite over http -->
</head>
<body class="f-root">
  <div class="f-app f-app--side"> <aside class="f-side">…</aside> <main class="f-main">…</main> </div>
</body>
</html>
```

Serve with any static server. On `file://` the sprite cannot load: inline `icons.svg` instead.
Open `preview.html` to see everything; rebuild it with `python3 build.py`.

## New client in 5 minutes

1. Copy `theme.example.css` to `theme.css`; set primary, accent and a neutral hue (or paste a daisyUI theme-generator block, or pick a name from `themes.json`).
2. Drop the logo into the logo slots (below).
3. Pick shape and density on `<html>`: `data-radius`, `data-layout`, `data-density`.
4. Copy the pages you need from `pages/`. Check: add `data-check` to the plinth.js tag and open the page (console + badge), or call `Plinth.check()`.

### Theme contract (daisyUI-compatible)

```css
[data-theme="acme"] {
  --neutral-hue: 300;                                  /* Plinth presets only: tints the default greys */
  --color-primary: #7a1fa2;  --color-primary-content: #fff;
  --color-accent:  #ffe14d;  --color-accent-content:  #1d1800;
}
```

Full set: `--color-base-100/200/300/content`, `--color-primary/secondary/accent/neutral(-content)`, `--color-info/success/warning/error(-content)`, `--radius-box/field/selector`. `--size-*`, `--border`, `--depth`, `--noise` are accepted but ignored. Everything else (hover, tints, borders, status backgrounds, legible status text, link colour) is **derived**, so light and dark themes both work without extra rules.

| Switch on `<html>` | Values |
|---|---|
| `data-theme` | `pine indigo ink terracotta ocean` + any daisyUI name (`corporate`, `dracula`, `night`…) |
| `data-mode` | `light` or `dark`. Works with **every** theme: themes.css generates the other mode of each theme from its own colours (`Plinth.setMode('auto')` follows the OS) |
| `data-radius` | `crisp`, `square` (square implies docked panels) |
| `data-layout` | `floating` (default), `docked` |
| `data-density` | `compact` |
| `data-palette` | secondary palette, colours only: `warm` (teal, coral-pink, sunny yellow, stronger tints) or `muted` (low-chroma, light tints). Omit for default |
| `data-style` | secondary style, how badges, alerts and icon badges are drawn: `caps`, `outline`, `dot`. Omit for soft. No radii: corners follow `data-radius` |
| `data-canvas` | page grey (light mode): `soft` (theme hue, lighter), `cool`, `mist`, `paper`, `white`. Omit for the original tint |

Status colours (`--ok --warn --danger --info --ai --high --neu`, each with `-fg` and `-bg`) are fixed hues, the same in every theme; a `data-palette` swaps the whole set (contrast-checked: 3 palettes x 4 styles x 6 canvases x themes x light/dark). Extra classes: `f-pill--high|neutral|brand-soft|quiet`, `f-alert--bordered`.

Notes on themes:
- Link ONE file: `themes/NAME.css` (about 2 KB, light + dark). `themes.css` holds all 10 for the gallery.
- Our "pine" preset is the old "forest" look (renamed so it does not clash with daisyUI's `forest`).
- `themes.py` swaps a daisyUI theme's `-content` colour for white/black where it missed WCAG AA 4.5:1 (listed as `a11y_patched` in `themes.json`).
- Contrast: every shipped theme (5 Plinth + 5 daisyUI: corporate, business, nord, dracula, cupcake) passes an axe-core colour-contrast sweep in light and dark. The other 30 daisyUI themes were dropped: 8 fail it, and the rest were curated out. To ship another, add its name to `KEEP` in `tools/themes.py`, rebuild, and re-check. Text tiers and the destructive button adapt to the theme automatically.
- Chart colours are fixed (`--chart-1..4`, validated for colour-blind separation) and some fall below 3:1 against white. That is by design: charts always carry a legend, direct labels and a table view.

### Panels: floating or docked

Floating (default) panels sit as rounded cards on a tinted canvas. Docked panels butt against the viewport edges with 1px lines. Square corners imply docked; override with `data-layout="floating"`.

## Logo placement

| Slot | Where | Markup |
|---|---|---|
| Sidebar head | Top-left, mark + wordmark | `.f-logo` |
| Mark only | Top-nav shell, collapsed sidebar | `.f-logo.f-logo--mark` |
| Org switcher | Multi-tenant | `.f-logo.f-logo--org` |
| Auth / splash | Sign-in, 404 | `.f-logo.f-logo--lg` |

Ask the client for a square mark (SVG, transparent, ≥64×64), a horizontal wordmark (SVG, up to 6:1) and a white wordmark if theirs is dark. Never stretch or recolour client artwork.

## Pages (`pages/`)

Each is a `<section data-screen="…">` fragment using only Plinth classes. `preview.js` wires them with sample data; the markup is the reusable part.

| Page | Patterns |
|---|---|
| dashboard | Hero card, KPI tiles, attention table with risk meters, activity, next action |
| orders | List page: count tabs, search, filters + chips, column picker, saved views, sortable table, drawer, bulk bar, pager, empty state |
| detail | Record page: stepper, tabs, key-value cards, timeline, AI estimate |
| pipeline | Kanban with drag and drop |
| inbox | Threads + conversation + composer |
| reports | Filters, sparklines, line chart with tooltip + table view, bars, histogram |
| tables | Grouping, inline editing, sticky dense grid, loading/empty/error |
| form | 4-step wizard, choice cards, validation, line items, uploads, review |
| calendar | Month grid with status-coloured events |
| notifications | Feed with search and category chips |
| settings | Branding (logo + colours), team, notifications, API keys, danger zone |
| profile | Personal info, password, 2FA, sessions |
| billing | Plans, usage meters, payment method, invoices |
| onboarding | Checklist with progress |
| errors | 404, 403, 500, maintenance, offline |
| auth | Sign in, sign up, forgot password, 2FA (switch with `data-f-view`) |
| ui | Every overlay, control and feedback component |
| docs · themes · palettes · icons · roadmap | In-app how-to page, theme gallery (click to apply), palettes, styles and canvas greys side by side, icon browser, roadmap |
| `_overlays` | Shared dialogs, drawers, confirm dialogs, command palette, menus |

## Icons

Lucide, curated into `icons.list` (10 categories). `icons.json` has name, category and search tags for each. Browse them on the Icons page (search, size, stroke, click to copy).

```
python3 tools/icons.py add truck "Operations & fabrication"   # add one and rebuild
python3 tools/icons.py subset index.html > sprite.svg         # production: only the icons you use
```

## Components and behaviour

`components.json` lists every component with classes, modifiers, example markup and the daisyUI name. `plinth.js` documents its data-attribute API in its header comment; it covers dialogs, menus, toasts, command palette, tabs, wizard, view switching, table selection/sorting/grouping/column picker, live filtering, chips, board drag and drop, copy, theme switching and the icon sprite loader.

## For AI agents

Plinth is built to be used by agents. Point one at the folder or at a hosted link and say what to build.

| Kit is | Tell the agent |
|---|---|
| in the project (`plinth/`) | "Build the Suppliers screen. Read `plinth/AGENTS.md` first." Tools that auto-read `AGENTS.md`/`CLAUDE.md` find it themselves; paste `AGENTS.snippet.md` into the project's own AGENTS.md |
| hosted | "Build the Suppliers screen. Read `https://plinth.pages.dev/llms-full.txt` first and link the kit from `https://plinth.pages.dev/`." |

- `llms-full.txt`: the whole kit in one document (rules, components with markup, behaviours, themes, icons, pages, a working starter). Regenerated by `python3 build.py`.
- `llms.txt` index, `AGENTS.md` rules, `SKILL.md` packaged skill, `components.json` / `icons.json` / `themes.json` machine-readable catalogues, `CLAUDE.md` / `.cursor/` / `.github/` pointers.
- **Validation runs in the browser**: add `data-check` to the plinth.js script tag (or `?check` in the URL). The console lists unknown classes, missing icons, unlabeled controls and stray daisyUI/Tailwind class names; `Plinth.check()` returns them as an array. `python3 tools/check.py file.html` does the same statically, optionally.
- **Hosted copy**: https://plinth.pages.dev/ (Cloudflare Pages, free plan; every push to `main` on GitHub `ramdevai/plinth` redeploys). Live preview: https://plinth.pages.dev/preview.html
- **Hosting elsewhere**: any static host (GitHub Pages, Cloudflare Pages, Netlify, S3), or a public GitHub repo through jsDelivr. `_headers` enables the cross-origin icon sprite. `index.html` is the landing page with copy-paste prompts.

Python is only for maintaining the kit (`tools/icons.py`, `tools/themes.py`, `build.py`). Building an app never needs it.

## Design rules baked in

1. One highlight per screen. 2. Colour is meaning, never the only signal. 3. Big numbers, small labels, mono for identifiers. 4. Every detail screen answers "what next?". 5. Count tabs are the primary filter. 6. Charts: legend, direct labels, table view, tooltips, no dual axes. 7. Destructive actions confirm and say what will be lost.

## Quality rules

Native `<dialog>` (focus trap, Esc), ARIA roles added by plinth.js to tabs, toggles and group rows (arrow-key navigation on tabs), skip link (`.f-skip`), every control labelled, visible focus rings, 24px+ hit areas, `prefers-reduced-motion`, `forced-colors` and print styles, container queries, tables scroll inside their wrapper, sidebar collapses to an icon rail under 900px and a bottom tab bar under 600px, two-column layouts stack under 1000px. Checked with axe-core (WCAG 2.2 AA + best practice): 0 violations on every page in light and dark. Not supported: right-to-left layouts (physical margins/paddings are used).

## Roadmap

See the Roadmap page: **micro-animation** (motion tokens, press/hover, overlay transitions, loading states, count-up, reduced motion), **MCP server** (list/get components, search icons, make a theme from a brand colour, scaffold a page, check HTML) and **motion graphics** (themeable SVG scenes for empty states and onboarding, chart enter animations, page transitions).

## Caveats

- Needs current browsers (2024+): `oklch()`, `color-mix()`, `light-dark()`, container queries, `:has()`, `<dialog>`.
- The preview loads Geist from Google Fonts; offline it falls back to system fonts.
- Where daisyUI has a component, Plinth uses its own `f-` class implementation (listed per component in `components.json`); it does not ship daisyUI's CSS (1.1 MB), which keeps typical apps small. plinth.css is 72 KB (about 15 KB gzipped), one theme adds under 1 KB.
- The charts in `preview.js` are hand-drawn SVG to show the spec. Use your charting library in real products and keep `--chart-1..4`.

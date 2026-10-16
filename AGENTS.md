# Plinth: instructions for AI agents

Plinth is a no-build CSS + JS kit for client apps: tight, professional, responsive, accessible and fast.
No Python, Node or npm needed to build with it. Read this file fully before writing UI.

## How you were pointed at it
- **A folder** (`plinth/` in the project, or this repo): use the files directly, paths below are relative to it.
- **A URL** (`https://plinth-ui.pages.dev/llms.txt`, or any file on another host): the folder of that URL is BASE. Fetch `BASE/llms-full.txt` for everything in one document, then link the kit straight from BASE:
  ```html
  <link rel="stylesheet" href="BASE/plinth.css" crossorigin>
  <link rel="stylesheet" href="BASE/themes/pine.css" crossorigin>
  <script src="BASE/plinth.js" data-sprite="BASE/icons.svg" defer></script>
  ```
  Page templates are at `BASE/pages/NAME.html`. (The icon sprite loads cross-origin only if the host sends CORS headers: GitHub Pages, Cloudflare Pages, jsDelivr and the bundled `_headers` file do. Otherwise copy `icons.svg` next to your page.)

## A client brief (the usual start)
The user may paste a block that begins `/* PLINTH CLIENT BRIEF`. It is the whole client setup. Apply it exactly:
1. Save the `[data-theme="client"] { ... }` block as `theme.css`. Link `plinth.css` then `theme.css` (no `themes/NAME.css` needed).
2. Copy the `html:` comment's attributes onto `<html>` (`data-theme="client"`, `data-mode`, `data-radius`, `data-layout`, `data-density`, and `data-palette` / `data-style` / `data-canvas` when present).
3. `shell:` sidebar means `<div class="f-app f-app--side">` with `<aside class="f-side">`; top-nav means `f-app--top` with `<header class="f-top">`.
4. `app-name:` is the product name: use it in the logo wordmark, the `<title>` and the sign-in page.
5. `logo:` is a `data:` URI (save it as `logo.svg` or `logo.png` and use `<span class="f-logo__mark f-logo__mark--bare"><img src="logo.svg" alt=""></span>`), or says to attach a file, or none (then use the initial letter in `f-logo__mark`). Never invent a logo.
6. Then build the screens the user asked for from `pages/`.

## Principles
- **No build.** Plain HTML, CSS, a little JS. Never add Tailwind, npm, bundlers or frameworks.
- **Write less, copy more.** Start from the closest page in `pages/` (or `starter.html`), edit text and data. Do not invent layouts.
- **Plinth classes only.** Use `f-` classes from `components.json`. Do not write new CSS. Per-client styling is colours in `theme.css`.
- **Semantic tokens, never raw colours.** `var(--primary)`, `var(--surface)`, `var(--text)`, `var(--ok)` … never hex in markup.
- **Accessible by default.** Every control has a name. Status is never colour alone. Keep focus rings.
- **Icons from `icons.json` only.** `<svg class="f-i"><use href="#i-NAME"/></svg>`.
- **Minimal HTML.** Inline `style` only for layout tweaks (gap, width). No `!important`.
- **App logic is yours, UI behaviour is the kit's.** Data loading, saving forms and rendering rows go in your own `app.js` (never inline `<script>` blocks). Never re-implement what `data-f-*` already does (modals, tabs, menus, sorting, filtering, wizards, toasts, copy, light/dark).

## Files
| File | Use |
|---|---|
| `plinth.css`, `plinth.js` | The kit. Do not edit per client |
| `themes/NAME.css` | ONE theme, light + dark. Link exactly one. 10 names in `themes.json` (5 Plinth + 5 daisyUI) |
| `theme.css` | A client's own colours (copy `theme.example.css`), linked after the theme |
| `components.json` | Every component: classes, modifiers, example markup, daisyUI name |
| `icons.svg`, `icons.json` | 320+ Lucide icons with tags. All are in the sprite |
| `pages/*.html` | 17 page templates + `_overlays.html` (modals, drawers, menus) |
| `starter.html` | Minimal working app shell |
| `preview.html` | Whole kit in one file: open it to see everything |
| `llms-full.txt` | All of the above condensed into one document |

## Workflow
1. Identify the screen type; copy the matching `<section>` from `pages/` (or start from `starter.html`).
2. Look components up in `components.json`; copy their `example`.
3. Wire behaviour with `data-f-*` attributes (header comment of `plinth.js`). Never write JS for tabs, modals, menus, sorting, filtering, wizards, toasts, copy, view switching, light/dark.
4. Pick a theme: `<html data-theme="NAME">` + `<link href="themes/NAME.css">`. Light/dark: `data-mode="dark|light"` (works with every theme; with no data-mode a theme shows its natural scheme) or `Plinth.setMode('auto')`.
5. **Validate in the browser:** add `data-check` to the plinth.js script tag (or open the page with `?check`). The console lists problems and a badge shows the count; `Plinth.check()` returns them as an array. Fix every error and warning, then remove `data-check`.
   Optional static check if Python is available: `python3 tools/check.py file.html`.

## Behaviour recipes (no custom JS)
```html
<!-- live search over rows, with an empty state -->
<label class="f-search"><svg class="f-i"><use href="#i-search"/></svg><input data-f-filter="#rows" placeholder="Search" aria-label="Search"></label>
<table class="f-table"><tbody id="rows"><tr data-f-text="acme tools active"><td>…</td></tr></tbody></table>
<div class="f-empty" data-f-filter-empty="#rows" hidden>…no matches…</div>
<!-- modal --> <button class="f-btn" data-f-open="#m">Add</button> <dialog class="f-modal" id="m">… <button data-f-close>Cancel</button></dialog>
<!-- toast --> <button data-f-toast="ok|Saved|Supplier added">Save</button>
<!-- light / dark --> <button data-f-mode="dark">Dark</button> <button data-f-mode="light">Light</button>
```

## Rules
- Shell: `<div class="f-app f-app--side">` (sidebar) or `f-app--top`; content in `<main class="f-main">`. `<body class="f-root">`.
- Load order: `plinth.css`, then the theme, then `theme.css`.
- Page header: `.f-head` with `.f-h1`, `.f-subtitle`, actions in `.f-head__actions`. One primary button per view.
- Tables inside `.f-tablewrap` (wide tables scroll inside it on phones, nothing else needed); sortable headers `th[data-sort]`.
- Dialogs are native `<dialog class="f-modal|f-drawer">`, opened with `data-f-open="#id"`.
- Forms: `.f-field` > `.f-label[for]` + `.f-input[id]`. Errors: `.f-field--error` + `.f-hint`.
- Status colour only via `f-pill--ok|warn|danger|info` / `f-alert--*`, with text or an icon.
- Charts use `--chart-1..4`, never the brand colour as a series.
- Corners/density: `data-radius="crisp|square"`, `data-density="compact"`. Do not hand-edit radii.
- Accessibility: first in `<body>` put `<a class="f-skip" href="#main">Skip to content</a>` and give `<main>` `id="main"`. One `<h1>` per page, card titles are `<h2 class="f-card__title">`, never skip a level. Icon-only buttons need `aria-label`. Tabs, toggles and group rows get their ARIA roles from plinth.js: write `data-f-tabs`, do not hand-roll roles.
- Phones (≤600px): the sidebar becomes a bottom tab bar, so keep the sidebar to 5 to 6 destinations (more scroll sideways). Content gets the full width.
- Do not use daisyUI/Tailwind class names (`btn`, `card`, `flex`…): the checker warns with the Plinth equivalent.

## Don't
- Add a framework, CSS reset, utility library or a second icon set.
- Hard-code colours, fonts or pixel radii.
- Remove `:focus-visible` styles, or rely on colour alone.
- Edit `plinth.css` for one client's request: change `theme.css` or ask.

## Definition of done
The browser check reports no issues; keyboard-only walk-through works; looks right in light and dark at 375px and 1440px.

## Secondary palette, style and canvas

Three independent switches on `<html>`, all optional: `data-palette="warm|muted"` (status colours), `data-style="caps|outline|dot"` (how badges, alerts and icon badges are drawn), `data-canvas="soft|cool|mist|paper|white"` (page grey). Corners are never part of them: use `data-radius`. If the client brief's `html:` line has any of these, copy them onto `<html>`. Never hard-code status colours: use `f-pill--ok|warn|danger|info|ai|high|neutral`, `f-alert--*`, `f-li__icon--*`, `f-kpi__badge--*`. See the Palettes page.

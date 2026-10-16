---
name: plinth
description: Build polished, accessible, responsive client apps (dashboards, tables, forms, auth, billing, settings) with Plinth, a no-build CSS/JS kit with daisyUI-compatible themes and Lucide icons. Use whenever the task is to create or edit screens in a project that contains plinth.css.
---

# Plinth

Read `AGENTS.md` for the full rules (or `llms-full.txt`, the same plus every component, if you can only fetch a URL). This skill is the short version.

## Use it like this
1. **Pick the page.** Match the request to a file in `pages/` (dashboard, orders, detail, pipeline, inbox, reports, tables, form, calendar, notifications, settings, profile, billing, onboarding, errors, ui, auth). Copy its `<section>`; replace text and rows.
2. **Look up parts** in `components.json` (classes, modifiers, example, daisyUI name). Use only `f-` classes.
3. **Behaviour is attributes**, not JS: `data-f-open`, `data-f-menu`, `data-f-tabs`, `data-f-filter`, `data-f-wizard`, `th[data-sort]`, `data-f-toast`, `data-f-copy`. See the header of `plinth.js`.
4. **Theme**: `<html data-theme="pine">` + `<link rel="stylesheet" href="themes/pine.css">` (one file, light + dark; 10 names in `themes.json`). `data-mode="dark|light"` works with every theme. A client theme is 3 colours in `theme.css`:
   ```css
   [data-theme="acme"] { --neutral-hue: 300; --color-primary: #7a1fa2; --color-primary-content: #fff; --color-accent: #ffe14d; --color-accent-content: #1d1800; }
   ```
5. **Icons**: `<svg class="f-i"><use href="#i-NAME"/></svg>`; names from `icons.json`; add with `python3 tools/icons.py add NAME`.
6. **Validate in the browser**: add `data-check` to the plinth.js script tag (or open the page with `?check`); fix everything it logs; `Plinth.check()` returns the list. No Python needed.

## Recipes
- **Primary action**: `<button class="f-btn f-btn--primary">Save</button>` (one per view).
- **Status**: `<span class="f-pill f-pill--ok f-pill--dot">Shipped</span>` (ok, warn, danger, info, ai).
- **Card**: `<div class="f-card"><div class="f-card__head"><div><h2 class="f-card__title">T</h2><p class="f-card__sub">S</p></div></div>…</div>`
- **Field**: `<div class="f-field"><label class="f-label" for="x">Name</label><input id="x" class="f-input"></div>`
- **Table**: `<div class="f-tablewrap"><table class="f-table"><thead><tr><th data-sort>Col</th></tr></thead><tbody>…</tbody></table></div>`
- **Modal**: `<dialog class="f-modal" id="m">…</dialog>` + `<button data-f-open="#m">`.
- **Tabs**: container `data-f-tabs`, each tab `aria-controls="panelId"`.
- **Live search**: `<input data-f-filter="#rows">` + `<tbody id="rows">` whose `<tr>`s carry `data-f-text="searchable words"`; empty state: `<div class="f-empty" data-f-filter-empty="#rows" hidden>`. No JS needed.
- **Empty state**: `<div class="f-empty"><span class="f-empty__icon">…</span><h3>Title</h3><p>Why and what next</p></div>`

## Never
Add Tailwind/npm/frameworks, hard-code colours, invent new CSS, remove focus rings, use colour alone for status, use daisyUI/Tailwind class names.

/* ==========================================================================
   plinth.js — optional behaviour for Plinth. No dependencies, no build.
   Everything is driven by data-attributes, so pages stay plain HTML.

   Check      <script src="plinth.js" data-check defer>  or ?check in the URL: console + badge. Plinth.check() returns the list
   Base URL   [data-f-base]  replaces {BASE} in its text and data-f-copy with this page's folder URL
   Sprite     <script src="plinth.js" data-sprite="icons.svg" defer>   auto-inject the icon sprite (http only)
   Attribute  data-f-set-attr="#grid > *|data-mode|dark"  set an attribute on every match (value - removes it)
   Mode       Plinth.setMode('light'|'dark'|'auto')   [data-f-mode="dark"] on any button; works with every theme
   Overlays   data-f-open="#id"        open a <dialog class="f-drawer|f-modal">
              data-f-close             close the dialog it sits in
              data-f-menu="#id"        toggle a .f-menu (data-align="end|center")
              Plinth.toast({kind,title,text})   data-f-toast="ok|Title|Text"
              ⌘K / Ctrl+K              opens #cmd if present
   Tabs       [data-f-tabs] > [aria-controls="panelId"]
   Wizard     [data-f-wizard]  [data-f-step]  [data-f-next] [data-f-prev] [data-f-finish]
   Tables     [data-f-select="#bulkBar"]  [data-f-all]  [data-f-row]   select + bulk bar
              th[data-sort]  (+ td[data-v] for raw values)             sorting
              tr.f-group[aria-expanded]                                 collapsible groups
              [data-f-expand]                                           expandable rows
              [data-f-cols="#tableId"] > input[data-f-col="name"]       column visibility
   Filter     <input data-f-filter="#rows">  filters the children of #rows (a <tbody>, list or grid) as you type.
              Give each child data-f-text="searchable words". Optional: [data-f-filter-cat="#rows"] chips (children
              carry data-cat), [data-f-filter-count="#rows"] shows the visible count, [data-f-filter-empty="#rows"] [hidden]
              is shown when nothing matches (put your empty state there).
   Misc       [data-f-chips]  single-select chips      [data-f-remove]  remove filter chip
              [data-f-view="#id"]                     show one of several [data-f-viewitem] siblings (auth views)
              [data-f-theme="name"]                   set <html data-theme> (theme gallery); fires 'f-theme'
              [data-f-copy="text"]                     [data-f-dismiss] close an alert
              [data-f-toggle="#id"]                    show/hide an element
              .f-board  (cards .f-kcard[draggable])    drag between columns
   ========================================================================== */
(function () {
  'use strict';
  const Plinth = (window.Plinth = window.Frame = window.Plinth || window.Frame || {});  // window.Frame kept as an alias for older pages
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const icon = (n) => `<svg class="f-i f-i--sm"><use href="#i-${n}"/></svg>`;

  /* ---------- icon sprite: <script src="plinth.js" data-sprite="icons.svg" defer> injects it (needs http, not file://) ---------- */
  const me = document.currentScript;
  if (me && me.dataset.sprite && !document.getElementById('plinth-sprite')) {
    fetch(me.dataset.sprite).then((r) => r.text()).then((t) => { const d = document.createElement('div'); d.id = 'plinth-sprite'; d.hidden = true; d.innerHTML = t; (document.body || document.documentElement).prepend(d); })
      .catch(() => console.warn('Plinth: could not load', me.dataset.sprite, '(serve over http, or inline icons.svg)'));
  }

  /* ---------- light / dark: Plinth.setMode('light'|'dark'|'auto'), data-f-mode="dark" ---------- */
  const root = document.documentElement, mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  let modePref = null;
  const effective = () => (modePref === 'auto' ? (mq && mq.matches ? 'dark' : 'light') : modePref);
  Plinth.setMode = function (m) {
    modePref = m; root.dataset.mode = effective(); try { localStorage.setItem('f-mode', m); } catch (_) {}
  };
  if (mq) mq.addEventListener('change', () => { if (modePref === 'auto') root.dataset.mode = effective(); });
  try { const saved = localStorage.getItem('f-mode'); if (saved && root.hasAttribute('data-f-remember')) Plinth.setMode(saved); } catch (_) {}
  /* data-scheme mirrors the theme's real colour-scheme so logo swaps etc. work for every theme */
  const syncScheme = () => { const cs = getComputedStyle(root).colorScheme || ''; root.dataset.scheme = /dark/.test(cs) && !/light/.test(cs) ? 'dark' : 'light'; };
  new MutationObserver(syncScheme).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });
  document.addEventListener('DOMContentLoaded', syncScheme); syncScheme();

  /* ---------- [data-f-base]: replaces {BASE} in text and data-f-copy with the folder URL this page is served from ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const base = /^https?:/.test(location.protocol) ? location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '') : 'https://YOUR-HOST/';
    $$('[data-f-base]').forEach((el) => { el.textContent = el.textContent.replace(/\{BASE\}/g, base); if (el.dataset.fCopy) el.dataset.fCopy = el.dataset.fCopy.replace(/\{BASE\}/g, base); });
  });

  /* ---------- dialogs ---------- */
  Plinth.open = function (target) {
    const d = typeof target === 'string' ? $(target) : target;
    if (!d) return null;
    closeMenus();
    d.removeAttribute('data-closing');
    if (!d.open) d.showModal();
    const focus = $('[autofocus]', d); if (focus) focus.focus();
    d.dispatchEvent(new CustomEvent('f-open'));
    return d;
  };
  Plinth.close = function (d) {
    if (!d || !d.open || d.hasAttribute('data-closing')) return;
    d.setAttribute('data-closing', '');
    setTimeout(() => { d.removeAttribute('data-closing'); d.close(); }, 160);
  };

  /* ---------- menus / popovers ---------- */
  let menu = null, trigger = null;
  function closeMenus() {
    if (menu) menu.removeAttribute('data-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    menu = trigger = null;
  }
  function place(m, t) {
    const r = t.getBoundingClientRect();
    m.style.visibility = 'hidden'; m.setAttribute('data-open', '');
    const w = m.offsetWidth, h = m.offsetHeight, a = t.dataset.align || 'start';
    let left = a === 'end' ? r.right - w : a === 'center' ? r.left + (r.width - w) / 2 : r.left;
    left = Math.max(8, Math.min(left, innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
    m.style.left = left + 'px'; m.style.top = Math.max(8, top) + 'px'; m.style.visibility = '';
  }
  Plinth.menu = function (t) {
    const m = $(t.dataset.fMenu); if (!m) return;
    if (menu === m) { closeMenus(); return; }
    closeMenus(); place(m, t); t.setAttribute('aria-expanded', 'true'); menu = m; trigger = t;
  };
  window.addEventListener('resize', closeMenus);
  document.addEventListener('scroll', (e) => { if (menu && !menu.contains(e.target)) closeMenus(); }, true);

  /* ---------- toasts ---------- */
  Plinth.toast = function (o) {
    o = o || {};
    let box = $('.f-toasts');
    if (!box) { box = document.createElement('div'); box.className = 'f-toasts'; box.setAttribute('popover', 'manual'); document.body.append(box); }
    const kind = o.kind || 'ok';
    const el = document.createElement('div');
    el.className = 'f-toast f-toast--' + kind; el.setAttribute('role', 'status');
    el.innerHTML = `<span class="f-toast__icon">${icon({ ok: 'check', warn: 'triangle-alert', danger: 'triangle-alert', info: 'sparkles' }[kind] || 'check')}</span>
      <div class="f-toast__body"><b></b><span></span></div><button class="f-toast__x" aria-label="Dismiss">${icon('x')}</button>`;
    el.querySelector('b').textContent = o.title || 'Done';
    const sp = el.querySelector('span:not(.f-toast__icon)'); if (o.text) sp.textContent = o.text; else sp.remove();
    const kill = () => { el.remove(); if (!box.children.length) try { box.hidePopover(); } catch (_) {} };
    el.querySelector('.f-toast__x').onclick = kill;
    box.append(el);
    try { if (box.matches(':popover-open')) box.hidePopover(); box.showPopover(); } catch (_) {}
    setTimeout(kill, o.timeout || 4200);
  };

  /* ---------- tabs ---------- */
  function tabs(tab) {
    const wrap = tab.closest('[data-f-tabs]'), kind = wrap.dataset.fKind;
    $$('[aria-controls], .f-tab', wrap).forEach((t) => {
      const on = t === tab;
      if (kind === 'toggle') t.setAttribute('aria-pressed', on);
      else if (kind === 'nav') on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
      else t.setAttribute('aria-selected', on);
      if (kind === 'tabs') t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
    });
  }

  /* ---------- semantics: roles/labels the markup would otherwise need to repeat ---------- */
  function semantics(root) {
    root = root || document;
    $$('[data-f-tabs]', root).forEach((w) => {
      if (w.dataset.fKind) return;
      const items = $$('.f-tab, [aria-controls]', w); if (!items.length) return;
      const on = (i) => i.getAttribute('aria-selected') === 'true' || i.getAttribute('aria-current') === 'page' || i.getAttribute('aria-pressed') === 'true';
      if (items.some((i) => i.hasAttribute('aria-controls'))) {
        w.dataset.fKind = 'tabs'; w.setAttribute('role', 'tablist');
        items.forEach((i) => { i.setAttribute('role', 'tab'); i.setAttribute('aria-selected', on(i)); i.removeAttribute('aria-current'); i.tabIndex = on(i) ? 0 : -1; });
      } else if (items.every((i) => i.tagName === 'A')) {
        w.dataset.fKind = 'nav';
        items.forEach((i) => { on(i) ? i.setAttribute('aria-current', 'page') : i.removeAttribute('aria-current'); i.removeAttribute('aria-selected'); });
      } else {
        w.dataset.fKind = 'toggle';
        items.forEach((i) => { i.setAttribute('aria-pressed', on(i)); i.removeAttribute('aria-selected'); });
      }
    });
    $$('tr.f-group[aria-expanded]', root).forEach((tr) => {
      const t = $('td .f-row, td', tr); if (!t) return;
      t.setAttribute('role', 'button'); t.tabIndex = 0; t.setAttribute('aria-expanded', tr.getAttribute('aria-expanded')); tr.removeAttribute('aria-expanded');
    });
    $$('pre.f-code:not([tabindex])', root).forEach((p) => { p.tabIndex = 0; });
    $$('thead th:empty', root).forEach((th) => { th.innerHTML = '<span class="f-sr">Actions</span>'; });
  }
  Plinth.semantics = semantics;
  document.addEventListener('keydown', (e) => {
    const tb = e.target.closest && e.target.closest('[data-f-kind="tabs"] [role="tab"]');
    if (tb && /^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) {
      const all = $$('[role="tab"]', tb.parentNode), i = all.indexOf(tb);
      const n = e.key === 'Home' ? all[0] : e.key === 'End' ? all[all.length - 1] : all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
      e.preventDefault(); n.focus(); tabs(n); return;
    }
    const g = e.target.matches && e.target.matches('tr.f-group [role="button"]');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.closest('tr').click(); }
  });
  document.addEventListener('DOMContentLoaded', () => semantics());

  /* ---------- wizard ---------- */
  function wizard(root, to) {
    const panels = $$('[data-f-step]', root), steps = $$('.f-step', root);
    let i = +(root.dataset.fIndex || 0); i = Math.max(0, Math.min(panels.length - 1, to === undefined ? i : to)); root.dataset.fIndex = i;
    panels.forEach((p, k) => (p.hidden = k !== i));
    steps.forEach((s, k) => {
      s.dataset.state = k < i ? 'done' : k === i ? 'active' : 'todo';
      const dot = $('.f-step__dot', s); if (dot) dot.innerHTML = k < i ? icon('check') : '';
    });
    $$('[data-f-stepno]', root).forEach((e) => (e.textContent = i + 1));
    $$('[data-f-prev]', root).forEach((b) => (b.hidden = i === 0));
    $$('[data-f-next]', root).forEach((b) => (b.hidden = i === panels.length - 1));
    $$('[data-f-finish]', root).forEach((b) => (b.hidden = i !== panels.length - 1));
    Plinth.onWizard && Plinth.onWizard(root, i);
  }
  Plinth.wizard = wizard;

  /* ---------- table selection + bulk bar ---------- */
  function syncSelect(scope) {
    const rows = $$('[data-f-row]', scope), n = rows.filter((c) => c.checked).length;
    rows.forEach((c) => { const tr = c.closest('tr'); if (tr) tr.setAttribute('aria-selected', c.checked); });
    const all = $('[data-f-all]', scope);
    if (all) { all.checked = n === rows.length && n > 0; all.indeterminate = n > 0 && n < rows.length; }
    const bar = $(scope.dataset.fSelect);
    if (bar) { bar.hidden = n === 0; bar._scope = scope; const c = $('[data-f-count]', bar); if (c) c.textContent = n + ' selected'; }
  }

  /* ---------- sorting ---------- */
  const val = (c) => { if (!c) return ''; const v = c.dataset.v !== undefined ? c.dataset.v : c.textContent.trim(); return v !== '' && !isNaN(+v) ? +v : String(v).toLowerCase(); };
  function sort(th) {
    const table = th.closest('table'), idx = Array.from(th.parentNode.children).indexOf(th);
    const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
    $$('th[aria-sort]', table).forEach((h) => h.removeAttribute('aria-sort')); th.setAttribute('aria-sort', dir);
    const tb = table.tBodies[0], rows = Array.from(tb.rows);
    rows.sort((a, b) => { const x = val(a.cells[idx]), y = val(b.cells[idx]); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true }); return dir === 'ascending' ? c : -c; })
      .forEach((r) => tb.append(r));
  }

  /* ---------- groups / expand ---------- */
  function group(tr) {
    const tg = $('[aria-expanded]', tr) || tr, open = tg.getAttribute('aria-expanded') !== 'false'; tg.setAttribute('aria-expanded', !open);
    let n = tr.nextElementSibling; while (n && !n.classList.contains('f-group')) { n.hidden = open; if (n.classList.contains('f-expand')) n.hidden = true; n = n.nextElementSibling; }
  }
  function expand(btn) {
    const tr = btn.closest('tr'), d = tr.nextElementSibling; if (!d || !d.classList.contains('f-expand')) return;
    const open = d.hidden; d.hidden = !open; btn.setAttribute('aria-expanded', open);
  }

  /* ---------- board drag & drop ---------- */
  let drag = null;
  function counts() { $$('.f-col').forEach((c) => { const n = $$('.f-kcard', c).length, e = $('.f-col__count', c); if (e) e.textContent = n; }); }
  document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('.f-kcard[draggable]'); if (!c) return; drag = c; setTimeout(() => c.classList.add('is-dragging'), 0); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', ''); } catch (_) {} });
  document.addEventListener('dragend', () => { if (drag) drag.classList.remove('is-dragging'); drag = null; $$('.f-col[data-over]').forEach((c) => c.removeAttribute('data-over')); counts(); });
  document.addEventListener('dragover', (e) => {
    if (!drag) return; const body = e.target.closest && e.target.closest('.f-col__body'); if (!body) return;
    e.preventDefault(); $$('.f-col[data-over]').forEach((c) => c.removeAttribute('data-over')); body.closest('.f-col').setAttribute('data-over', '');
    const after = $$('.f-kcard:not(.is-dragging)', body).find((c) => e.clientY < c.getBoundingClientRect().top + c.offsetHeight / 2);
    after ? body.insertBefore(drag, after) : body.append(drag);
  });

  /* ---------- dropzone ---------- */
  document.addEventListener('dragover', (e) => { const z = e.target.closest && e.target.closest('.f-drop'); if (z) { e.preventDefault(); z.setAttribute('data-over', ''); } });
  document.addEventListener('dragleave', (e) => { const z = e.target.closest && e.target.closest('.f-drop'); if (z) z.removeAttribute('data-over'); });
  document.addEventListener('drop', (e) => { const z = e.target.closest && e.target.closest('.f-drop'); if (z) { e.preventDefault(); z.removeAttribute('data-over'); z.dispatchEvent(new CustomEvent('f-files', { detail: Array.from(e.dataTransfer.files), bubbles: true })); } });

  /* ---------- command palette ---------- */
  function cmdItems(d) { return $$('.f-cmd__item', d).filter((i) => !i.hidden); }
  function cmdSelect(d, k) { const it = cmdItems(d); if (!it.length) return; k = (k + it.length) % it.length; $$('.f-cmd__item', d).forEach((i) => i.setAttribute('aria-selected', 'false')); it[k].setAttribute('aria-selected', 'true'); it[k].scrollIntoView({ block: 'nearest' }); }
  document.addEventListener('input', (e) => {
    const d = e.target.closest && e.target.closest('.f-cmd'); if (!d || e.target.tagName !== 'INPUT') return;
    const q = e.target.value.trim().toLowerCase();
    $$('.f-cmd__item', d).forEach((i) => (i.hidden = q && !i.textContent.toLowerCase().includes(q)));
    $$('.f-cmd__group', d).forEach((g) => { let n = g.nextElementSibling, any = false; while (n && !n.classList.contains('f-cmd__group')) { if (!n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; });
    cmdSelect(d, 0);
  });
  document.addEventListener('f-open', (e) => { const d = e.target; if (d.classList && d.classList.contains('f-cmd')) { const i = $('input', d); if (i) { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); } cmdSelect(d, 0); } });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { const c = $('#cmd'); if (c) { e.preventDefault(); Plinth.open(c); } return; }
    if (e.key === 'Escape' && menu) { closeMenus(); return; }
    const d = e.target.closest && e.target.closest('.f-cmd'); if (!d) return;
    const it = cmdItems(d), cur = it.findIndex((i) => i.getAttribute('aria-selected') === 'true');
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelect(d, cur + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelect(d, cur - 1); }
    if (e.key === 'Enter' && it[cur]) { e.preventDefault(); it[cur].click(); }
  });

  /* ---------- delegated clicks ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches && t.matches('dialog.f-drawer, dialog.f-modal')) { Plinth.close(t); return; }   // backdrop click

    const mt = t.closest('[data-f-menu]');
    if (mt) { e.preventDefault(); Plinth.menu(mt); return; }
    if (menu && !menu.contains(t)) closeMenus();
    const st = t.closest('[data-f-set]');
    if (st && menu && menu.contains(st)) {          // radio-style menu item: check it, copy text to the trigger's [data-f-label]
      $$('[data-f-set]', menu).forEach((b) => b.setAttribute('aria-checked', b === st));
      const lb = trigger && $('[data-f-label]', trigger); if (lb) lb.textContent = st.dataset.fSet;
      menu.dispatchEvent(new CustomEvent('f-set', { detail: st, bubbles: true }));
    }
    const item = t.closest('.f-menu__item');
    if (item && menu && menu.contains(item) && !item.hasAttribute('data-f-keep') && !item.closest('label')) closeMenus();

    const op = t.closest('[data-f-open]'); if (op) { e.preventDefault(); Plinth.open(op.dataset.fOpen); return; }
    const cl = t.closest('[data-f-close]'); if (cl) { Plinth.close(cl.closest('dialog')); return; }
    const ct = t.closest('[data-f-toast]'); if (ct) { const [k, ti, tx] = ct.dataset.fToast.split('|'); Plinth.toast({ kind: k, title: ti, text: tx }); }
    const sa = t.closest('[data-f-set-attr]');
    if (sa) { const [sel, name, val] = sa.dataset.fSetAttr.split('|'); $$(sel).forEach((e) => (val === '-' ? e.removeAttribute(name) : e.setAttribute(name, val))); $$('[data-f-set-attr]', sa.parentNode).forEach((x) => x.setAttribute('aria-pressed', x === sa)); }
    const md = t.closest('[data-f-mode]'); if (md) Plinth.setMode(md.dataset.fMode);
    const vw = t.closest('[data-f-view]'); if (vw) { const tg = $(vw.dataset.fView); if (tg) { $$(':scope > [data-f-viewitem]', tg.parentNode).forEach((c) => (c.hidden = c !== tg)); const f = $('input', tg); if (f) f.focus(); } }
    const tcard = t.closest('[data-f-theme]'); if (tcard) { document.documentElement.dataset.theme = tcard.dataset.fTheme; document.dispatchEvent(new CustomEvent('f-theme', { detail: tcard.dataset.fTheme })); $$('[data-f-theme]').forEach((x) => x.setAttribute('aria-pressed', x === tcard)); }
    const cp = t.closest('[data-f-copy]'); if (cp) { try { navigator.clipboard.writeText(cp.dataset.fCopy); } catch (_) {} Plinth.toast({ kind: 'ok', title: 'Copied to clipboard' }); }
    const ds = t.closest('[data-f-dismiss]'); if (ds) { const a = ds.closest('.f-alert'); if (a) a.remove(); }
    const tg = t.closest('[data-f-toggle]'); if (tg) { const el = $(tg.dataset.fToggle); if (el) { el.hidden = !el.hidden; tg.setAttribute('aria-pressed', !el.hidden); } }
    const tb = t.closest('[data-f-tabs] [aria-controls], [data-f-tabs] .f-tab'); if (tb) { tabs(tb); return; }
    const w = t.closest('[data-f-wizard]');
    if (w) { if (t.closest('[data-f-next]')) wizard(w, +w.dataset.fIndex + 1); else if (t.closest('[data-f-prev]')) wizard(w, +w.dataset.fIndex - 1); }
    const ch = t.closest('[data-f-chips] .f-chip[aria-pressed]'); if (ch) { $$('.f-chip', ch.parentNode).forEach((c) => c.setAttribute('aria-pressed', c === ch)); ch.parentNode.dispatchEvent(new CustomEvent('f-chip', { detail: ch, bubbles: true })); }
    const sg = t.closest('.f-seg button'); if (sg && !sg.closest('.studio')) { $$('button', sg.parentNode).forEach((b) => b.setAttribute('aria-pressed', b === sg)); }
    const rm = t.closest('[data-f-remove]'); if (rm) { const f = rm.closest('.f-fchip, .f-tag'); const par = f && f.parentNode; if (f) f.remove(); par && par.dispatchEvent(new CustomEvent('f-removed', { bubbles: true })); }
    const th = t.closest('th[data-sort]'); if (th) sort(th);
    const gr = t.closest('tr.f-group'); if (gr) group(gr);
    const ex = t.closest('[data-f-expand]'); if (ex) expand(ex);
    const bc = t.closest('[data-f-clear]'); if (bc) { const bar = bc.closest('[data-f-bulk]'); const sc = bar && bar._scope; if (sc) { $$('[data-f-row],[data-f-all]', sc).forEach((c) => (c.checked = false)); syncSelect(sc); } }
  });
  document.addEventListener('change', (e) => {
    const t = e.target, sc = t.closest && t.closest('[data-f-select]');
    if (sc && t.matches('[data-f-all]')) $$('[data-f-row]', sc).forEach((c) => (c.checked = t.checked));
    if (sc && (t.matches('[data-f-all]') || t.matches('[data-f-row]'))) syncSelect(sc);
    const col = t.closest && t.closest('[data-f-col]');
    if (col) { const host = t.closest('[data-f-cols]'), table = host && $(host.dataset.fCols); if (table) $$(`[data-col="${col.dataset.fCol}"]`, table).forEach((c) => (c.hidden = !col.checked)); }
  });
  document.addEventListener('DOMContentLoaded', () => { $$('[data-f-wizard]').forEach((w) => wizard(w, 0)); counts(); });

  /* ---------- filter (search + category) and CSS-variable buttons ---------- */
  function applyFilter(grid) {
    const q = ($(`[data-f-filter="#${grid.id}"]`) || {}).value || '', cat = ($(`[data-f-filter-cat="#${grid.id}"] .f-chip[aria-pressed="true"]`) || { dataset: {} }).dataset.value || '';
    const words = q.toLowerCase().split(/\s+/).filter(Boolean); let n = 0;
    Array.from(grid.children).forEach((c) => { const t = c.dataset.fText || c.textContent.toLowerCase(); const ok = words.every((w) => t.includes(w)) && (!cat || c.dataset.cat === cat); c.hidden = !ok; if (ok) n++; });
    $$(`[data-f-filter-count="#${grid.id}"]`).forEach((e) => (e.textContent = n));
    $$(`[data-f-filter-empty="#${grid.id}"]`).forEach((e) => (e.hidden = n > 0));
    grid.hidden = n === 0;
  }
  document.addEventListener('input', (e) => { const s = e.target.matches && e.target.matches('[data-f-filter]') && $(e.target.dataset.fFilter); if (s) applyFilter(s); });
  document.addEventListener('f-chip', (e) => { const g = e.target.dataset && e.target.dataset.fFilterCat && $(e.target.dataset.fFilterCat); if (g) applyFilter(g); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-f-var]'); if (!b) return;
    const [sel, name, value] = b.dataset.fVar.split('|'), t = $(sel); if (t) t.style.setProperty(name, value);
    $$('[data-f-var]', b.parentNode).forEach((x) => x.setAttribute('aria-pressed', x === b));
  });

  /* ---------- Plinth.check(): the validator, in the browser. No Python, no Node. ----------
     <script src="plinth.js" data-check defer>  (or add ?check to the URL) logs problems to the console and shows a badge.
     Agents with a browser: call Plinth.check() and read the returned array.  Each item: { level, msg, el } */
  const TW = { btn: 'f-btn', card: 'f-card', badge: 'f-pill', input: 'f-input', modal: 'f-modal', drawer: 'f-drawer', table: 'f-table', tabs: 'f-tabs', tab: 'f-tab', alert: 'f-alert', avatar: 'f-avatar', progress: 'f-progress', toggle: 'f-switch', checkbox: 'f-check', radio: 'f-radio', textarea: 'f-textarea', menu: 'f-menu', skeleton: 'f-skel', steps: 'f-steps', timeline: 'f-tl', stat: 'f-kpi', navbar: 'f-top', flex: 'f-row', grid: 'f-grid', 'text-sm': '(no utilities: use f- classes)', container: 'f-main' };
  /* inline-edit cells get an accessible name from their column header and row label */
  function labelCells(root) {
    $$('.f-cellinput:not([aria-label])', root || document).forEach((i) => {
      const td = i.closest('td'), tr = i.closest('tr'), table = i.closest('table'); if (!td || !table) return;
      const th = table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells[td.cellIndex];
      const first = tr.cells[0] && tr.cells[0] !== td ? (tr.cells[0].textContent || '').trim().slice(0, 40) : '';
      i.setAttribute('aria-label', [th && th.textContent.trim(), first].filter(Boolean).join(', ') || 'Value');
    });
  }
  Plinth.labelCells = labelCells;
  document.addEventListener('DOMContentLoaded', () => { labelCells(); setTimeout(labelCells, 300); });
  const remoteSheets = {};
  Plinth.checkReady = Promise.resolve();
  function loadRemoteSheets() {
    const jobs = Array.from(document.styleSheets).filter((sh) => { try { sh.cssRules; return false; } catch (_) { return !!sh.href; } }).map((sh) => fetch(sh.href).then((r) => r.text()).then((t) => (remoteSheets[sh.href] = t)).catch(() => {}));
    return (Plinth.checkReady = Promise.all(jobs));
  }
  if ((me && me.hasAttribute('data-check')) || /[?&]check\b/.test(location.search)) document.addEventListener('DOMContentLoaded', loadRemoteSheets);
  Plinth.check = function (scope) {
    labelCells();
    const out = [], root = scope || document, add = (level, msg, el) => out.push({ level, msg, el });
    const known = new Set(); let sheetsOk = true, themes = new Set();
    for (const sh of Array.from(document.styleSheets)) {
      let rules; try { rules = sh.cssRules; } catch (_) { const x = remoteSheets[sh.href]; if (x) { (x.match(/\.f-[a-z0-9_-]+/g) || []).forEach((c) => known.add(c.slice(1))); (x.match(/data-theme="([\w-]+)"/g) || []).forEach((m) => themes.add(m.slice(12, -1))); } else sheetsOk = false; continue; }
      const walk = (rs) => { for (const r of Array.from(rs)) { if (r.selectorText) { (r.selectorText.match(/\.f-[a-z0-9_-]+/g) || []).forEach((c) => known.add(c.slice(1))); (r.selectorText.match(/data-theme="([\w-]+)"/g) || []).forEach((m) => themes.add(m.slice(12, -1))); } if (r.cssRules) walk(r.cssRules); } };
      walk(rules);
    }
    const th = root.ownerDocument ? root.ownerDocument.documentElement.dataset.theme : document.documentElement.dataset.theme;
    if (th && sheetsOk && themes.size && !themes.has(th)) add('error', `data-theme="${th}" is not defined by any loaded stylesheet`, document.documentElement);
    if (!sheetsOk) add('info', 'some stylesheets could not be read (cross-origin without CORS); class names were not checked. await Plinth.checkReady before Plinth.check()');
    $$('[class]', root).forEach((el) => {
      if (el.closest('svg')) return;
      el.classList.forEach((c) => {
        if (c.startsWith('f-')) { if (sheetsOk && known.size && !known.has(c)) add('error', `unknown class "${c}"`, el); }
        else if (TW[c] && !el.closest('pre,code')) add('warn', `"${c}" is a daisyUI/Tailwind name: use ${TW[c]}`, el);
      });
    });
    $$('use', root).forEach((u) => { const h = u.getAttribute('href') || ''; if (h.startsWith('#i-') && !document.getElementById(h.slice(1))) add('error', `icon "${h.slice(3)}" is not in the sprite (see icons.json)`, u); });
    $$('button, a[class]', root).forEach((b) => { if (!b.textContent.trim() && !b.querySelector('img[alt]') && !(b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.title) && !b.hasAttribute('data-logo')) add('error', `<${b.tagName.toLowerCase()}> has no text and no aria-label`, b); });
    $$('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea', root).forEach((f) => { if (!(f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || f.closest('label') || (f.id && document.querySelector(`label[for="${f.id}"]`)))) add('warn', `<${f.tagName.toLowerCase()}${f.type ? ' type=' + f.type : ''}> has no label`, f); });
    $$('img:not([alt])', root).forEach((i) => add('error', '<img> without alt', i));
    if (!document.body.classList.contains('f-root')) add('warn', '<body> needs class="f-root"', document.body);
    if (!document.querySelector('meta[name=viewport]')) add('warn', 'missing <meta name="viewport">');
    return out;
  };
  async function runCheck() {
    await loadRemoteSheets();
    const r = Plinth.check(), n = r.filter((x) => x.level !== 'info').length;
    r.forEach((x) => console[x.level === 'error' ? 'error' : x.level === 'warn' ? 'warn' : 'info']('[Plinth] ' + x.msg, x.el || ''));
    const b = document.createElement('button'); b.textContent = n ? `Plinth: ${n} issue${n > 1 ? 's' : ''}` : 'Plinth: no issues';
    b.setAttribute('data-f-check-badge', ''); b.style.cssText = `position:fixed;right:12px;bottom:12px;z-index:99999;padding:6px 12px;border:0;border-radius:999px;font:500 12px system-ui;color:#fff;background:${n ? '#c2410c' : '#15803d'};cursor:pointer;box-shadow:0 2px 8px rgb(0 0 0/.3)`;
    b.onclick = () => { const w = window.open('', '_blank'); if (w) { w.document.write('<pre style="font:13px/1.5 ui-monospace,monospace;padding:16px">' + (r.map((x) => `${x.level.toUpperCase()}  ${x.msg}`).join('\n') || 'No issues').replace(/</g, '&lt;') + '</pre>'); } };
    document.body.append(b); window.__plinthCheck = r;
  }
  if ((me && me.hasAttribute('data-check')) || /[?&]check\b/.test(location.search)) document.addEventListener('DOMContentLoaded', () => setTimeout(runCheck, 400));

  Plinth.refresh = function (root) { semantics(root); $$('[data-f-wizard]', root || document).forEach((w) => wizard(w)); counts(); labelCells(root); };
})();

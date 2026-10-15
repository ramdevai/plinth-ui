/* preview.js — demo wiring for preview.html ONLY (sample data, routing, studio bar, charts).
   Not part of the framework: copy ideas from it, not the file. */
(function () {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ic = (n, c = 'f-i f-i--sm') => `<svg class="${c}"><use href="#i-${n}"/></svg>`;
const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const k = (n) => '$' + Math.round(n).toLocaleString('en-US');
const av = (i, h) => `<span class="f-avatar" style="--av:${h}">${i}</span>`;
const OWNERS = { PS: ['Priya Shah', 40], AK: ['Arun Kapoor', 200], RM: ['Rhea Mehta', 320] };
const STATUS_PILL = { New: 'info', 'In production': 'brand', Waiting: 'warn', Shipped: 'ok' };
const PRIO_PILL = { Urgent: 'danger', High: 'warn', Normal: '' };
const PRIO_RANK = { Urgent: 3, High: 2, Normal: 1 };

/* ---------------- state ---------------- */
const state = { name: 'Northwind', logo: null, theme: 'pine', mode: 'light', radius: 'soft', layout: 'floating', density: 'comfortable', shell: 'side', screen: 'dashboard' };
const NAV = [
  { k: 'dashboard', label: 'Overview', icon: 'layout-grid' }, { k: 'orders', label: 'Orders', icon: 'inbox', n: '128' },
  { k: 'pipeline', label: 'Pipeline', icon: 'package' }, { k: 'inbox', label: 'Inbox', icon: 'message-circle', n: '3' }, { k: 'reports', label: 'Reports', icon: 'chart-column' },
];
const GROUPS = [
  { label: 'Patterns', items: [{ k: 'tables', label: 'Data tables', icon: 'table' }, { k: 'form', label: 'New order form', icon: 'pencil' }, { k: 'calendar', label: 'Calendar', icon: 'calendar' }, { k: 'notifications', label: 'Notifications', icon: 'bell' }, { k: 'ui', label: 'Overlays & UI', icon: 'sparkles' }] },
  { label: 'Account & billing', items: [{ k: 'settings', label: 'Settings', icon: 'settings' }, { k: 'profile', label: 'Profile & security', icon: 'user' }, { k: 'billing', label: 'Billing', icon: 'credit-card' }, { k: 'onboarding', label: 'Onboarding', icon: 'rocket' }] },
  { label: 'States & sign-in', items: [{ k: 'errors', label: 'Error states', icon: 'triangle-alert' }, { k: 'auth', label: 'Sign in / up', icon: 'log-in' }] },
  { label: 'Kit', items: [{ k: 'docs', label: 'How to use', icon: 'book-open' }, { k: 'themes', label: 'Themes', icon: 'palette' }, { k: 'icons', label: 'Icons', icon: 'shapes' }, { k: 'roadmap', label: 'Roadmap', icon: 'map' }] },
];
const ALIAS = { detail: 'orders' };

/* ---------------- sample data ---------------- */
const ATTN = [
  ['Bracket plates', 'Missing drawing', 'Halden Mechanical', 62, 'warn', 'Oct 9'], ['Enclosure panels', 'Missing material cert', 'Brook & Sons', 58, 'warn', 'Oct 9'],
  ['Gasket set', 'Awaiting approval', 'Northline Heating', 47, 'danger', 'Oct 10'], ['Mounting rails', 'Customer requested change', 'Ardent Electric', 66, 'warn', 'Oct 11'],
  ['Cover plates', 'Stock shortage', 'Rivet Plumbing', 54, 'danger', 'Oct 12'],
];
const ACT = [
  ['ok', 'check', 'Order shipped', 'Gasket kit · Rivet Plumbing', '9:12 AM'], ['warn', 'triangle-alert', 'More files requested', 'Enclosure panels · Brook & Sons', '8:47 AM'],
  ['danger', 'x', 'Quote declined', 'Cover plates · Ardent Electric', '8:05 AM'], ['ai', 'sparkles', 'AI review completed', 'Bracket plates · Halden', 'Yesterday'],
  ['ok', 'check', 'Payment received', 'Mounting rails · Northline', 'Yesterday'],
];
const CUST = ['Halden Mechanical', 'Northline Heating', 'Ardent Electric', 'Brook & Sons', 'Rivet Plumbing'];
// name, customer, priority, status, owner, age (min), sla text, value
const ORDERS = [
  ['Water jet cut, 6 mm plates', CUST[0], 'Urgent', 'New', 'PS', 18, '27 min left', 12400], ['Radiator bracket, bent', CUST[1], 'Urgent', 'In production', 'AK', 60, 'on site', 8200],
  ['Hinge plates, 120 pcs', CUST[1], 'High', 'New', 'PS', 120, '4 h left', 5600], ['Window frame corners', CUST[0], 'High', 'New', 'RM', 360, '9 h left', 9800],
  ['Light fitting backplates', CUST[2], 'Normal', 'In production', 'AK', 300, 'on site', 4300], ['Lock plate, stainless', CUST[3], 'Normal', 'Waiting', 'RM', 1440, 'customer', 3100],
  ['Drain flange set', CUST[4], 'Normal', 'In production', 'PS', 1500, 'Thu 10:00', 6700], ['Cold room shelf brackets', CUST[3], 'Normal', 'New', 'AK', 240, '40 h left', 7400],
  ['Shower mount plates', CUST[4], 'Normal', 'Waiting', 'RM', 2880, 'customer', 2200], ['Extractor fan frames', CUST[2], 'High', 'New', 'PS', 180, '41 h left', 11800],
  ['Cover plates, powder coat', CUST[4], 'Urgent', 'Waiting', 'AK', 3000, 'customer', 5200], ['Gasket set', CUST[1], 'Normal', 'Shipped', 'PS', 4300, 'delivered', 3900],
  ['Mounting rails, 2 m', CUST[2], 'Normal', 'Shipped', 'RM', 5800, 'delivered', 8800], ['Enclosure panels', CUST[3], 'High', 'Waiting', 'AK', 960, 'customer', 14200],
];
ORDERS.forEach((o, i) => o.unshift('ORD-' + (4821 - i * 3)));
const age = (m) => (m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' d');

/* ---------------- fill: dashboard / orders ---------------- */
function fillDashboard() {
  $('[data-rows=attention]').innerHTML = ATTN.map((r) => `<tr data-click data-go="detail"><td><div class="f-cell__title">${r[0]}</div></td>
    <td><span class="f-row" style="gap:8px"><span class="f-li__icon f-li__icon--warn" style="width:26px;height:26px">${ic('triangle-alert')}</span>${r[1]}</span></td><td class="f-muted">${r[2]}</td>
    <td style="white-space:nowrap"><b style="font-size:16px;font-weight:500;margin-right:8px">${r[3]}%</b><span class="f-meter f-meter--${r[4]}" style="--v:${r[3]};width:70px"><i></i></span></td>
    <td class="f-muted" style="white-space:nowrap">${r[5]}</td><td class="f-r"><button class="f-btn f-btn--sm">Review</button></td></tr>`).join('');
  $('[data-rows=activity]').innerHTML = ACT.map((r) => `<div class="f-li"><span class="f-li__icon f-li__icon--${r[0]}">${ic(r[1])}</span><div class="f-li__body"><div class="f-li__title">${r[2]}</div><div class="f-li__sub">${r[3]}</div></div><span class="f-li__end">${r[4]}</span></div>`).join('');
}
const dot = (c, t) => `<span style="display:inline-flex;align-items:center;gap:6px;color:var(--${c === 'ok' ? 'ok-fg' : c === 'warn' ? 'warn-fg' : 'text-3'})"><i style="width:6px;height:6px;border-radius:50%;background:currentColor"></i>${t}</span>`;
function fillOrders() {
  $('#ordersBody').innerHTML = ORDERS.map((o, i) => {
    const [id, name, cust, pr, st, ow, ag, sla, val] = o;
    const slac = /left/.test(sla) ? (parseInt(sla) <= 30 && /min/.test(sla) ? 'warn' : '') : sla === 'on site' || sla === 'delivered' ? 'ok' : '';
    return `<tr data-click data-i="${i}" data-status="${st}" data-priority="${pr}" data-customer="${cust}" data-owner="${ow}" data-q="${(name + id + cust).toLowerCase()}">
    <td class="f-w1"><input type="checkbox" class="f-check" data-f-row aria-label="Select ${id}"></td>
    <td data-v="${name}"><div class="f-cell__title">${name}</div><div class="f-cell__sub">${id}</div></td>
    <td class="f-muted" data-col="customer">${cust}</td>
    <td data-col="priority" data-v="${PRIO_RANK[pr]}"><span class="f-pill ${PRIO_PILL[pr] ? 'f-pill--' + PRIO_PILL[pr] : ''}">${pr}</span></td>
    <td data-col="status"><span class="f-pill f-pill--${STATUS_PILL[st]}">${st}</span></td>
    <td data-col="owner" title="${OWNERS[ow][0]}">${av(ow, OWNERS[ow][1])}</td>
    <td class="f-mono" data-col="age" data-v="${ag}">${age(ag)}</td>
    <td data-col="sla" data-v="${i}">${dot(slac, sla)}</td>
    <td class="f-r"><button class="f-btn f-btn--ghost f-btn--icon f-btn--sm" data-f-menu="#rowMenu" data-align="end" aria-label="More">${ic('ellipsis')}</button></td></tr>`;
  }).join('');
}

/* ---- orders filtering ---- */
const F = { status: '', priority: '', customer: '', owner: '', q: '' };
function applyFilters() {
  let n = 0;
  $$('#ordersBody tr').forEach((tr) => {
    const ok = (!F.status || tr.dataset.status === F.status) && (!F.priority || tr.dataset.priority === F.priority) && (!F.customer || tr.dataset.customer === F.customer) &&
      (!F.owner || tr.dataset.owner === F.owner) && (!F.q || tr.dataset.q.includes(F.q));
    tr.hidden = !ok; if (ok) n++;
  });
  $$('[data-f-shown]').forEach((e) => (e.textContent = n));
  $('#ordersEmpty').hidden = n > 0; $('#ordersTable').hidden = n === 0;
  const chips = [['priority', 'Priority'], ['customer', 'Customer'], ['owner', 'Owner']].filter(([key]) => F[key]);
  const box = $('#applied');
  box.innerHTML = chips.map(([key, l]) => `<span class="f-fchip" data-k="${key}">${l}: <span>${key === 'owner' ? (OWNERS[F.owner] || [F.owner])[0] : F[key]}</span><button data-f-remove aria-label="Remove filter">${ic('x')}</button></span>`).join('');
  box.hidden = !chips.length;
  $('#fPriority').value = F.priority; $('#fCustomer').value = F.customer;
  $$('#fOwner button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === F.owner));
  $$('#statusChips .f-chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.value === F.status));
}
function wireOrders() {
  $('#orderSearch').addEventListener('input', (e) => { F.q = e.target.value.trim().toLowerCase(); applyFilters(); });
  $('#statusChips').addEventListener('f-chip', (e) => { F.status = e.detail.dataset.value; applyFilters(); });
  $('#applied').addEventListener('f-removed', () => { ['priority', 'customer', 'owner'].forEach((key) => { if (!$(`#applied [data-k=${key}]`)) F[key] = ''; }); applyFilters(); });
  $('#applyFilters').addEventListener('click', () => { F.priority = $('#fPriority').value; F.customer = $('#fCustomer').value; F.owner = ($('#fOwner [aria-pressed=true]') || {}).dataset?.v || ''; Frame.menu && closeAny(); applyFilters(); });
  const reset = () => { Object.assign(F, { status: '', priority: '', customer: '', owner: '', q: '' }); $('#orderSearch').value = ''; applyFilters(); };
  $('#resetFilters').addEventListener('click', reset); $('#clearFilters').addEventListener('click', reset);
  $('#viewsMenu').addEventListener('f-set', (e) => {
    const v = e.detail.dataset.view; Object.assign(F, { status: '', priority: '', customer: '', owner: '', q: '' }); $('#orderSearch').value = '';
    if (v === 'urgent') F.priority = 'Urgent'; if (v === 'waiting') F.status = 'Waiting'; if (e.detail.dataset.fSet === 'My orders') F.owner = 'PS';
    applyFilters();
  });
  $('#confirmDelete').addEventListener('f-open', () => { const n = $$('#ordersBody [data-f-row]:checked').length || 1; $('#cdTitle').textContent = `Delete ${n} order${n > 1 ? 's' : ''}?`; });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-do="delete"]')) return;
    const rows = $$('#ordersBody [data-f-row]:checked').map((c) => c.closest('tr')); (rows.length ? rows : [rowCtx].filter(Boolean)).forEach((r) => r.remove());
    $$('#ordersCard [data-f-row],#ordersCard [data-f-all]').forEach((c) => (c.checked = false)); $('#bulk').hidden = true; applyFilters();
    Frame.toast({ kind: 'ok', title: 'Orders deleted', text: 'This is a preview. Reload to restore the sample data.' });
  });
}
function closeAny() { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }

/* ---- order drawer ---- */
let rowCtx = null;
function openOrder(i) {
  const o = ORDERS[i]; if (!o) return;
  $('#odTitle').textContent = o[1]; $('#odId').textContent = o[0]; $('#odCust').textContent = $('#odCust2').textContent = o[2];
  const st = $('#odStatus'); st.textContent = o[4]; st.className = 'f-pill f-pill--dot f-pill--' + STATUS_PILL[o[4]];
  const p = $('#odPrio'); p.textContent = o[3]; p.className = 'f-pill ' + (PRIO_PILL[o[3]] ? 'f-pill--' + PRIO_PILL[o[3]] : '');
  Frame.open('#orderDrawer');
}

/* ---------------- fill: pipeline ---------------- */
function fillBoard() {
  const cols = { New: [0, 2, 3, 7], 'Awaiting files': [5, 8], 'In production': [1, 4, 6], 'Ready to ship': [11, 12] };
  Object.entries(cols).forEach(([c, idx]) => {
    $(`[data-col-body="${c}"]`).innerHTML = idx.map((i) => { const o = ORDERS[i]; return `<div class="f-kcard" draggable="true" data-i="${i}"><div class="f-kcard__title">${o[1]}</div>
      <div class="f-row" style="gap:6px">${o[3] !== 'Normal' ? `<span class="f-pill f-pill--${PRIO_PILL[o[3]]}">${o[3]}</span>` : ''}<span class="f-faint" style="font-size:12.5px">${o[2]}</span></div>
      <div class="f-kcard__foot"><span class="f-mono">${o[0]} · ${k(o[8])}</span>${av(o[5], OWNERS[o[5]][1])}</div></div>`; }).join('');
  });
}

/* ---------------- fill: inbox ---------------- */
const THREADS = [
  ['Halden Mechanical', 'HM', 40, 'Understood. Engineering is finishing it today. Can we hold the slot on the laser…', '11:48', 1], ['Northline Heating', 'NH', 200, 'Please confirm the delivery window for the hinge plates.', '10:02', 1],
  ['Brook & Sons', 'BS', 320, 'Attached the updated material certificate, thanks.', '9:15', 1], ['Ardent Electric', 'AE', 120, 'Great, approved. Go ahead and schedule it.', 'Mon', 0], ['Rivet Plumbing', 'RP', 260, 'Invoice received, payment goes out Friday.', 'Mon', 0], ['Halden Mechanical', 'HM', 40, 'Can we get a quote for 300 more pieces?', 'Sun', 0],
];
function fillThreads() {
  $('#threadList').innerHTML = THREADS.map((t, i) => `<div class="f-thread" role="option" aria-selected="${i === 0}" ${t[5] ? 'data-unread' : ''}><span class="f-avatar f-avatar--lg" style="--av:${t[2]}">${t[1]}</span>
    <div style="min-width:0;flex:1"><div class="f-thread__top"><span class="f-thread__name">${t[0]}</span><span class="f-thread__time">${t[4]}</span></div><div class="f-thread__prev">${t[3]}</div></div></div>`).join('');
}

/* ---------------- fill: tables page ---------------- */
function fillTables() {
  const groups = {}; ORDERS.slice(0, 11).forEach((o) => (groups[o[2]] = groups[o[2]] || []).push(o));
  $('#groupBody').innerHTML = Object.entries(groups).map(([c, os]) => `<tr class="f-group" aria-expanded="true"><td colspan="6"><span class="f-row" style="gap:10px">${ic('chevron-down', 'f-i f-i--sm f-chev')}${c}<span class="f-pill">${os.length} orders</span><span class="f-faint" style="margin-left:auto;font-weight:400">${k(os.reduce((a, o) => a + o[8], 0))}</span></span></td></tr>` +
    os.map((o) => `<tr><td><button class="f-btn f-btn--ghost f-btn--icon f-btn--sm" data-f-expand aria-expanded="false" aria-label="Show line items">${ic('chevron-right')}</button></td><td><div class="f-cell__title">${o[1]}</div><div class="f-cell__sub">${o[0]}</div></td>
      <td><span class="f-pill f-pill--${STATUS_PILL[o[4]]}">${o[4]}</span></td><td class="f-r f-mono">${Math.round(o[8] / 40)}</td><td class="f-r f-mono">${k(o[8])}</td><td class="f-muted">Oct ${9 + (o[8] % 5)}</td></tr>
      <tr class="f-expand" hidden><td colspan="6"><div class="f-grid f-cols-3"><div><div class="f-label">Material</div>Mild steel, 3 mm</div><div><div class="f-label">Process</div>Laser cut → bend → powder coat</div><div><div class="f-label">Notes</div>Deburr all edges</div></div></td></tr>`).join('')).join('');
  $('#collapseAll').onclick = () => $$('#groupBody tr.f-group [aria-expanded=true]').forEach((g) => g.closest('tr').click());
  $('#expandAll').onclick = () => $$('#groupBody tr.f-group [aria-expanded=false]').forEach((g) => g.closest('tr').click());

  const line = (a, b, q, p) => `<tr><td><input class="f-cellinput" value="${a}"></td><td><input class="f-cellinput" value="${b}"></td><td class="f-r"><input class="f-cellinput" data-q value="${q}" inputmode="numeric" style="text-align:right"></td>
    <td class="f-r"><input class="f-cellinput" data-p value="${p}" inputmode="decimal" style="text-align:right"></td><td class="f-r f-mono" data-t></td><td><button class="f-btn f-btn--ghost f-btn--icon f-btn--sm" data-rm aria-label="Remove line">${ic('x')}</button></td></tr>`;
  const lines = (body, calc, rows, blank) => {
    body.innerHTML = rows.map((r) => line(...r)).join('');
    const recalc = () => { let sum = 0; $$('tr', body).forEach((tr) => { const t = (parseFloat($('[data-q]', tr).value) || 0) * (parseFloat($('[data-p]', tr).value) || 0); $('[data-t]', tr).textContent = money(t); sum += t; }); calc(sum); };
    body.addEventListener('input', recalc);
    body.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { b.closest('tr').remove(); recalc(); } });
    recalc(); return () => { body.insertAdjacentHTML('beforeend', line(...blank)); recalc(); $$('input', body.lastElementChild)[0].focus(); };
  };
  const addLine = lines($('#lineBody'), (s) => { $('#subTotal').textContent = money(s); $('#gst').textContent = money(s * 0.18); $('#grandTotal').textContent = money(s * 1.18); },
    [['Bracket plate, 3 mm', 'Mild steel', 120, 180], ['Enclosure panel', 'Stainless 304', 60, 240.5], ['Hinge set', 'Zinc plated', 300, 12.75]], ['New item', 'Mild steel', 1, 0]);
  $('#addLine').onclick = addLine;
  const addPart = lines($('#partBody'), (s) => { $('#partTotal').textContent = money(s); $('#reviewTotal').textContent = money(s); },
    [['Bracket plate', 'Mild steel, 3 mm', 120, 180], ['Cover plate', 'Aluminium 5052', 200, 95], ['Side rail', 'Mild steel, 2 mm', 100, 76]], ['New part', 'Mild steel, 3 mm', 1, 0]);
  $('#addPart').onclick = addPart;

  const mats = ['Mild steel', 'Stainless 304', 'Aluminium 5052', 'Brass', 'Zinc plated'], names = ['Bracket', 'Flange', 'Cover plate', 'Hinge', 'Spacer', 'Gusset', 'Rail', 'Clip'];
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  $('#gridBody').innerHTML = Array.from({ length: 40 }, (_, i) => {
    const hand = Math.round(rnd() * 900), res = Math.round(rnd() * hand * .6), low = hand - res < 80, pct = Math.min(100, Math.round(((hand - res) / 900) * 100 * 1.6));
    return `<tr><td class="f-stick f-mono">SKU-${1040 + i * 7}</td><td>${names[i % 8]} ${String.fromCharCode(65 + (i % 6))}</td><td class="f-muted">${mats[i % 5]}</td><td class="f-r f-mono" data-v="${1 + (i % 6)}">${1 + (i % 6)} mm</td>
      <td class="f-r f-mono" data-v="${hand}">${hand}</td><td class="f-r f-mono" data-v="${res}">${res}</td><td><span class="f-minibar" style="--v:${pct}${low ? ';background:var(--warn)' : ''}"></span><span class="f-faint" style="font-size:12.5px">${low ? 'Low' : 'OK'}</span></td>
      <td class="f-mono">${String.fromCharCode(65 + (i % 4))}-${1 + (i % 9)}-${1 + (i % 3)}</td><td class="f-r f-mono" data-v="${(3 + rnd() * 40).toFixed(2)}">${money(3 + rnd() * 40)}</td></tr>`;
  }).join('');
  $('#gridDensity').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) $('#gridTable').classList.toggle('f-table--dense', b.dataset.d === 'dense'); });
}

/* ---------------- fill: settings ---------------- */
function fillSettings() {
  const team = [['Priya Shah', 'priya@northwind.com', 'Admin', 'Now', 'ok', 'Active', 40], ['Arun Kapoor', 'arun@northwind.com', 'Member', '2 h ago', 'ok', 'Active', 200], ['Rhea Mehta', 'rhea@northwind.com', 'Member', 'Yesterday', 'ok', 'Active', 320],
    ['Dev Patel', 'dev@northwind.com', 'Member', '3 days ago', 'ok', 'Active', 120], ['Meera Rao', 'meera@northwind.com', 'Admin', '1 week ago', 'ok', 'Active', 260], ['sam@brookandsons.com', '', 'Member', 'n/a', 'warn', 'Invited', 0]];
  $('#teamBody').innerHTML = team.map((m) => `<tr><td><div class="f-row" style="gap:12px">${m[6] ? av(m[0].split(' ').map((x) => x[0]).join(''), m[6]) : `<span class="f-avatar" style="background:var(--surface-3);color:var(--text-3)">${ic('mail')}</span>`}<div><div class="f-cell__title">${m[0]}</div>${m[1] ? `<div class="f-cell__sub">${m[1]}</div>` : ''}</div></div></td>
    <td>${m[2]}</td><td class="f-muted">${m[3]}</td><td><span class="f-pill f-pill--${m[4]} f-pill--dot">${m[5]}</span></td><td class="f-r"><button class="f-btn f-btn--ghost f-btn--icon f-btn--sm" data-f-menu="#kebabMenu" data-align="end" aria-label="More">${ic('ellipsis')}</button></td></tr>`).join('');
  $('#reveal').addEventListener('click', () => { const c = $('#key1'), on = c.dataset.on !== '1'; c.dataset.on = on ? '1' : ''; c.textContent = on ? c.dataset.secret : 'nw_live_••••••••••'; $('#reveal').textContent = on ? 'Hide' : 'Reveal'; });
  const t = $('#typeConfirm'), b = $('#typeConfirmBtn'); if (t) t.addEventListener('input', () => { const ok = t.value.trim() === 'northwind'; b.disabled = !ok; b.style.opacity = ok ? 1 : .5; });
}

/* ---------------- charts ---------------- */
const NS = 'http://www.w3.org/2000/svg';
const WEEKS = ['Jul 14', 'Jul 21', 'Jul 28', 'Aug 4', 'Aug 11', 'Aug 18', 'Aug 25', 'Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29'];
const CREATED = [31, 36, 33, 41, 38, 45, 43, 49, 47, 52, 50, 58], SHIPPED = [28, 30, 35, 34, 40, 39, 44, 42, 48, 46, 51, 54];
function tipEl(box) { let t = $('.f-ctip', box); if (!t) { t = document.createElement('div'); t.className = 'f-ctip'; t.hidden = true; box.append(t); } return t; }
function lineChart(box, labels, series) {
  const W = 1040, H = 300, L = 36, R = 110, T = 14, B = 30, max = Math.ceil(Math.max(...series.flatMap((s) => s.v)) / 20) * 20;
  const x = (i) => L + (i * (W - L - R)) / (labels.length - 1), y = (v) => T + (1 - v / max) * (H - T - B);
  let s = `<svg class="f-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${series.map((q) => q.name).join(' and ')} per week">`;
  for (let g = 0; g <= 4; g++) { const v = (max / 4) * g; s += `<line class="f-grid-line" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  labels.forEach((l, i) => { if (i % 2 === 0 || i === labels.length - 1) s += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`; });
  series.forEach((q) => { s += `<path d="${q.v.map((v, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(v)).join(' ')}" fill="none" stroke="${q.c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`; });
  s += `<line class="f-crosshair" id="${box.id}X" y1="${T}" y2="${H - B}" x1="0" x2="0" style="display:none"/>`;
  series.forEach((q, qi) => { const i = labels.length - 1; s += `<circle class="f-ring" cx="${x(i)}" cy="${y(q.v[i])}" r="4.5" fill="${q.c}"/><text x="${x(i) + 12}" y="${y(q.v[i]) + 4}" style="fill:var(--text);font-weight:500">${q.name} ${q.v[i]}</text>`; });
  series.forEach((q, qi) => labels.forEach((_, i) => (s += `<circle class="f-ring" data-m="${i}" cx="${x(i)}" cy="${y(q.v[i])}" r="4.5" fill="${q.c}" style="display:none"/>`)));
  labels.forEach((_, i) => (s += `<rect class="f-hit" data-i="${i}" x="${x(i) - (W - L - R) / (labels.length - 1) / 2}" y="${T}" width="${(W - L - R) / (labels.length - 1)}" height="${H - T - B}"/>`));
  box.innerHTML = s + '</svg>';
  const svg = $('svg', box), tip = tipEl(box), xl = $('.f-crosshair', box);
  const hide = () => { tip.hidden = true; xl.style.display = 'none'; $$('[data-m]', svg).forEach((c) => (c.style.display = 'none')); };
  svg.addEventListener('mousemove', (e) => {
    const r = e.target.closest('.f-hit'); if (!r) return hide(); const i = +r.dataset.i;
    xl.setAttribute('x1', x(i)); xl.setAttribute('x2', x(i)); xl.style.display = '';
    $$('[data-m]', svg).forEach((c) => (c.style.display = +c.dataset.m === i ? '' : 'none'));
    tip.innerHTML = `<b>Week of ${labels[i]}</b>` + series.map((q) => `<span style="--c:${q.c}"><i></i>${q.name}: <b style="display:inline;margin:0">${q.v[i]}</b></span>`).join('');
    tip.hidden = false; const bw = box.clientWidth; tip.style.left = Math.max(70, Math.min(bw - 70, (x(i) / W) * bw)) + 'px'; tip.style.top = ((Math.min(...series.map((q) => y(q.v[i]))) / H) * svg.clientHeight) + 'px';
  });
  svg.addEventListener('mouseleave', hide);
}
function hbars(box, rows) {
  const W = 520, rh = 38, H = rows.length * rh + 6, L = 130, max = Math.max(...rows.map((r) => r[1])), tip = tipEl(box);
  box.innerHTML = `<svg class="f-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue by customer">` + rows.map((r, i) => { const w = ((W - L - 54) * r[1]) / max, yy = i * rh + 4;
    return `<g data-i="${i}"><rect class="f-hit" x="0" y="${yy}" width="${W}" height="${rh}"/><text x="0" y="${yy + 21}" style="fill:var(--text-2);font-size:13px">${r[0]}</text><rect x="${L}" y="${yy + 6}" width="${w}" height="20" rx="4" fill="var(--chart-1)"/><text x="${L + w + 8}" y="${yy + 21}" style="fill:var(--text);font-weight:500;font-size:12.5px">$${r[1]}k</text></g>`; }).join('') + '</svg>';
  $('svg', box).addEventListener('mousemove', (e) => { const g = e.target.closest('g[data-i]'); if (!g) { tip.hidden = true; return; } const r = rows[+g.dataset.i], b = box.getBoundingClientRect(); tip.innerHTML = `<b>${r[0]}</b><span style="--c:var(--chart-1)"><i></i>Revenue: $${r[1]}k</span>`; tip.hidden = false; tip.style.left = (e.clientX - b.left) + 'px'; tip.style.top = (e.clientY - b.top) + 'px'; });
  $('svg', box).addEventListener('mouseleave', () => (tip.hidden = true));
}
function histogram(box, bins) {
  const W = 520, H = 220, L = 30, B = 28, T = 10, max = Math.max(...bins.map((b) => b[1])), bw = (W - L) / bins.length, tip = tipEl(box);
  let s = `<svg class="f-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lead time distribution">`;
  for (let g = 0; g <= 3; g++) { const v = Math.round((max / 3) * g), yy = T + (1 - g / 3) * (H - T - B); s += `<line class="f-grid-line" x1="${L}" x2="${W}" y1="${yy}" y2="${yy}"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end">${v}</text>`; }
  bins.forEach((b, i) => { const h = ((H - T - B) * b[1]) / max, xx = L + i * bw; s += `<g data-i="${i}"><rect class="f-hit" x="${xx}" y="${T}" width="${bw}" height="${H - T - B}"/><path d="M${xx + 1} ${H - B} V${H - B - h + 4} a4 4 0 0 1 4 -4 h${bw - 10} a4 4 0 0 1 4 4 V${H - B} Z" fill="var(--chart-1)"/><text x="${xx + bw / 2}" y="${H - 8}" text-anchor="middle">${b[0]}</text></g>`; });
  box.innerHTML = s + '</svg>';
  $('svg', box).addEventListener('mousemove', (e) => { const g = e.target.closest('g[data-i]'); if (!g) { tip.hidden = true; return; } const r = bins[+g.dataset.i], b = box.getBoundingClientRect(); tip.innerHTML = `<b>${r[0]} days</b><span style="--c:var(--chart-1)"><i></i>${r[1]} orders</span>`; tip.hidden = false; tip.style.left = (e.clientX - b.left) + 'px'; tip.style.top = (e.clientY - b.top) + 'px'; });
  $('svg', box).addEventListener('mouseleave', () => (tip.hidden = true));
}
function spark(vals) { const w = 84, h = 28, mx = Math.max(...vals), mn = Math.min(...vals); return `<svg class="f-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${vals.map((v, i) => (i ? 'L' : 'M') + (i * w) / (vals.length - 1) + ' ' + (h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4))).join(' ')}"/></svg>`; }
function fillReports() {
  const kp = [['Orders created', '172', '↗ 12%', CREATED, ''], ['Revenue', '$482k', '↗ 8.4%', [30, 34, 33, 38, 41, 40, 46, 48], ''], ['Median lead time', '3.2 d', '↘ 0.4 d', [4.1, 3.9, 3.8, 3.6, 3.5, 3.4, 3.3, 3.2], ''], ['Cancelled', '4.1%', '↗ 0.6 pts', [3, 3.2, 3.1, 3.5, 3.4, 3.8, 3.9, 4.1], 'f-delta--bad']];
  $('#repKpis').innerHTML = kp.map((q) => `<div class="f-kpi"><div class="f-kpi__top"><span>${q[0]}</span></div><div><div class="f-row f-between"><div class="f-num" style="font-size:34px">${q[1]}</div>${spark(q[3])}</div><div class="f-delta ${q[4]}"><b>${q[2]}</b> vs previous 30 days</div></div></div>`).join('');
  const series = [{ name: 'Created', c: 'var(--chart-1)', v: CREATED }, { name: 'Shipped', c: 'var(--chart-2)', v: SHIPPED }];
  lineChart($('#chartMain'), WEEKS, series);
  $('#chartMainTable').innerHTML = `<table class="f-table"><thead><tr><th>Week of</th><th class="f-r">Created</th><th class="f-r">Shipped</th></tr></thead><tbody>${WEEKS.map((w, i) => `<tr><td>${w}</td><td class="f-r f-mono">${CREATED[i]}</td><td class="f-r f-mono">${SHIPPED[i]}</td></tr>`).join('')}</tbody></table>`;
  $('#chartView').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $('#chartMain').hidden = b.dataset.v === 'table'; $('#chartMainTable').hidden = b.dataset.v !== 'table'; });
  hbars($('#chartBars'), [['Halden Mechanical', 148], ['Northline Heating', 112], ['Brook & Sons', 96], ['Ardent Electric', 71], ['Rivet Plumbing', 38], ['Others', 17]]);
  histogram($('#chartHist'), [['1', 8], ['2', 26], ['3', 41], ['4', 28], ['5', 15], ['6', 8], ['7+', 6]]);
  const tc = [['Halden Mechanical', 38, 148, 96], ['Northline Heating', 31, 112, 94], ['Brook & Sons', 27, 96, 91], ['Ardent Electric', 22, 71, 97], ['Rivet Plumbing', 14, 38, 89]];
  $('#topCustomers').innerHTML = tc.map((r) => `<tr><td class="f-cell__title">${r[0]}</td><td class="f-r f-mono">${r[1]}</td><td><span class="f-minibar" style="--v:${r[2] * .8}"></span><span class="f-mono">$${r[2]}k</span></td><td class="f-r f-mono">${r[3]}%</td></tr>`).join('');
  const mix = [['New', 12, 'var(--chart-1)'], ['In production', 34, 'var(--chart-2)'], ['Waiting', 9, 'var(--chart-3)'], ['Shipped', 61, 'var(--chart-4)']];
  $('#statusMix').innerHTML = mix.map((m) => `<i style="--c:${m[2]};--w:${m[1]}" title="${m[0]}: ${m[1]}"></i>`).join('');
  $('#statusLegend').innerHTML = mix.map((m) => `<span style="--c:${m[2]};width:100%"><i></i>${m[0]}<b style="margin-left:auto;color:var(--text)">${m[1]}</b></span>`).join('');
}

/* ---------------- logo, shell, routing ---------------- */
const stage = $('#stage'), authHost = $('#authHost'), content = $('#content');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function logoHTML(kind) {
  const init = (state.name.trim()[0] || 'N').toUpperCase();
  const mark = state.logo ? `<span class="f-logo__mark f-logo__mark--bare"><img src="${state.logo}" alt=""></span>` : `<span class="f-logo__mark">${esc(init)}</span>`;
  return kind === 'mark' ? mark : mark + `<span class="f-logo__word">${esc(state.name)}</span>`;
}
function relogo() {
  $$('[data-logo]').forEach((el) => (el.innerHTML = logoHTML(el.dataset.logo)));
  $$('[data-brandmark]').forEach((el) => (el.innerHTML = state.logo ? `<img src="${state.logo}" alt="" style="width:100%;height:100%;object-fit:contain">` : esc((state.name.trim()[0] || 'N').toUpperCase())));
  $$('[data-brandword]').forEach((el) => (el.textContent = state.name));
}
function navHTML(side) {
  const a = (n) => side ? `<a data-go="${n.k}" data-nav-k="${n.k}">${ic(n.icon, 'f-i')}<span>${n.label}</span>${n.n ? `<span class="f-nav__n">${n.n}</span>` : ''}</a>` : `<a data-go="${n.k}" data-nav-k="${n.k}">${n.label}</a>`;
  return side ? NAV.map(a).join('') + GROUPS.map((g) => `<div class="f-nav__label">${g.label}</div>` + g.items.map(a).join('')).join('')
    : NAV.map(a).join('') + `<a data-f-menu="#patternsMenu" data-nav-k="more">Patterns ${ic('chevron-down')}</a>`;
}
function mount() {
  const tpl = $('#tpl-' + state.shell).content.cloneNode(true);
  $$('#stage [data-screen]').forEach((s) => content.append(s));
  $('#shell').replaceChildren(tpl);
  $$('[data-nav]', stage).forEach((n) => (n.innerHTML = navHTML(state.shell === 'side')));
  const slot = $('[data-slot]', stage);
  $$('#content > section').forEach((s) => (s.dataset.screen === 'auth' ? authHost.append(s) : slot.append(s)));
  relogo(); show(state.screen); Frame.refresh && Frame.refresh(document); readVars();
}
function show(name) {
  if (!$(`[data-screen="${name}"]`)) return;
  state.screen = name;
  const auth = name === 'auth'; authHost.hidden = !auth; stage.toggleAttribute('data-auth', auth);
  $$('[data-screen]').forEach((s) => (s.hidden = s.dataset.screen !== name));
  const key = ALIAS[name] || name, inTop = NAV.some((n) => n.k === key);
  $$('[data-nav] a', stage).forEach((a) => { const on = a.dataset.navK === key || (state.shell === 'top' && a.dataset.navK === 'more' && !inTop && !auth); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const slot = $('[data-slot]', stage); if (slot) slot.scrollTop = 0;
  try { history.replaceState(null, '', '#' + name); } catch (_) {}
}
window.show = show;

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-act="dark"]')) { state.mode = state.mode === 'dark' ? 'light' : 'dark'; apply(); return; }
  const mb = t.closest('[data-f-menu]'); const tr = t.closest('#ordersBody tr');
  if (mb && tr) rowCtx = tr;
  if (t.closest('#rowOpen')) { show('detail'); return; }
  const go = t.closest('[data-go]');
  if (go && !(t.closest('input,label,select,textarea') && !go.contains(t.closest('input,label,select,textarea')))) { if (!(t.closest('[data-f-menu],[data-f-open]') && t.closest('[data-f-menu],[data-f-open]') !== go)) { show(go.dataset.go); return; } }
  if (t.closest('input,label,select,textarea,[data-f-menu],[data-f-open],button,a')) { /* controls handle themselves */ }
  const row = t.closest('#ordersBody tr'); if (row && !t.closest('input,label,[data-f-menu]')) { rowCtx = row; openOrder(+row.dataset.i); return; }
  const card = t.closest('.f-kcard'); if (card && !t.closest('button')) { openOrder(+card.dataset.i); return; }
  const th = t.closest('.f-thread'); if (th) { $$('.f-thread').forEach((x) => x.setAttribute('aria-selected', x === th)); th.removeAttribute('data-unread'); }
});

/* ---------------- studio bar ---------------- */
const THEMES = { pine: '#1f3d2f', indigo: '#3a46c9', ink: '#17171a', terracotta: '#a8452b', ocean: '#0e5a68' };
const DAISY = /*DAISY*/[];
const sw = $('#swatches');
const tsel = $('#themeSel');
tsel.innerHTML = '<option value="">daisyUI themes…</option>' + ['light','dark'].map((k) => `<optgroup label="${k}">` + DAISY.filter((t) => t.scheme === k).map((t) => `<option value="${t.name}">${t.name}</option>`).join('') + '</optgroup>').join('');
const natural = (n) => (DAISY.find((t) => t.name === n) || { scheme: state.mode }).scheme;
document.addEventListener('f-theme', (e) => { state.theme = e.detail; state.mode = natural(e.detail); apply(); });
document.addEventListener('click', (e) => { const m = e.target.closest('[data-f-mode]'); if (m) { state.mode = m.dataset.fMode; apply(); } });
tsel.addEventListener('change', () => { if (tsel.value) { state.theme = tsel.value; state.mode = natural(tsel.value); apply(); } });
sw.innerHTML = Object.entries(THEMES).map(([n, c]) => `<button class="sw" data-theme-pick="${n}" title="${n}" aria-label="Theme ${n}" style="background:${c}"></button>`).join(' ');
function readVars() { requestAnimationFrame(() => { const cs = getComputedStyle(document.documentElement); $$('[data-f-readvar]').forEach((i) => (i.value = cs.getPropertyValue(i.dataset.fReadvar).trim())); }); }
function apply() {
  const h = document.documentElement;
  h.dataset.theme = state.theme; h.dataset.mode = state.mode; h.dataset.layout = state.layout;
  state.radius === 'soft' ? h.removeAttribute('data-radius') : (h.dataset.radius = state.radius);
  state.density === 'comfortable' ? h.removeAttribute('data-density') : (h.dataset.density = 'compact');
  $$('.sw').forEach((b) => b.setAttribute('aria-pressed', b.dataset.themePick === state.theme));
  tsel.value = DAISY.some((t) => t.name === state.theme) ? state.theme : '';
  $$('.studio .f-seg').forEach((s) => $$('button', s).forEach((b) => b.setAttribute('aria-pressed', state[s.dataset.ctl] === b.dataset.v)));
  readVars();
}
sw.addEventListener('click', (e) => { const b = e.target.closest('[data-theme-pick]'); if (b) { state.theme = b.dataset.themePick; apply(); } });
$$('.studio .f-seg').forEach((s) => s.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; const c = s.dataset.ctl; state[c] = b.dataset.v;
  if (c === 'radius') state.layout = state.radius === 'square' ? 'docked' : 'floating';   // square corners dock the panels to the edges
  apply(); if (c === 'shell') mount();
}));
$('#brandName').addEventListener('input', (e) => { state.name = e.target.value || 'Northwind'; relogo(); });
$('#logoFile').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { state.logo = r.result; relogo(); }; r.readAsDataURL(f); });
$('#logoReset').addEventListener('click', () => { state.logo = null; $('#logoFile').value = ''; relogo(); });
$('#copyCss').addEventListener('click', async () => {
  const cs = getComputedStyle(document.documentElement), g = (v) => cs.getPropertyValue(v).trim();
  const attrs = [['lang', 'en'], ['data-theme', 'client'], ['data-mode', state.mode], ['data-radius', state.radius === 'soft' ? '' : state.radius], ['data-layout', state.layout === 'floating' ? '' : state.layout], ['data-density', state.density === 'compact' ? 'compact' : '']].filter((x) => x[1]).map((x) => `${x[0]}="${x[1]}"`).join(' ');
  const logo = state.logo ? (state.logo.length <= 8000 ? state.logo : '(logo was uploaded in the preview but is too large to paste: attach the file to the chat)') : '(none: use the initial letter mark)';
  const css = `/* FRAME CLIENT BRIEF: give this to your agent together with the Frame link. */\n[data-theme="client"] {\n  --neutral-hue: ${g('--neutral-hue')};\n  --color-primary: ${g('--color-primary')};\n  --color-primary-content: ${g('--color-primary-content')};\n  --color-accent: ${g('--color-accent')};\n  --color-accent-content: ${g('--color-accent-content')};\n}\n/* html:  <html ${attrs}> */\n/* shell: ${state.shell === 'top' ? 'top-nav (f-app--top)' : 'sidebar (f-app--side)'} */\n/* app-name: ${state.name} */\n/* logo: ${logo} */`;
  try { await navigator.clipboard.writeText(css); } catch (_) {}
  Frame.toast({ kind: 'ok', title: 'Client brief copied', text: 'Paste it to your agent with the Frame link.' });
});

/* ---------------- boot ---------------- */
$('#patternsMenu').innerHTML = GROUPS.map((g) => `<div class="f-menu__label">${g.label}</div>` + g.items.map((n) => `<button class="f-menu__item" data-go="${n.k}">${ic(n.icon)}${n.label}</button>`).join('')).join('<div class="f-menu__sep"></div>');
fillDashboard(); fillOrders(); fillBoard(); fillThreads(); fillTables(); fillSettings(); fillReports(); wireOrders(); applyFilters();
state.screen = ($$('[data-screen]').some((s) => s.dataset.screen === location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard');
apply(); mount(); Frame.semantics();
})();

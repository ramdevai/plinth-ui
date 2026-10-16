"""Builds preview.html — one self-contained file (CSS, JS, icons, every page and overlay inlined).
Run:  python3 build.py
Pages live in pages/*.html (each a <section data-screen="…">), shared dialogs/menus in pages/_overlays.html.
"""
import pathlib, json
d = pathlib.Path(__file__).parent
rd = lambda p: (d / p).read_text()
order = ['dashboard', 'orders', 'detail', 'pipeline', 'inbox', 'reports', 'tables', 'form', 'calendar', 'notifications', 'settings', 'profile', 'billing', 'onboarding', 'errors', 'ui', 'docs', 'themes', 'palettes', 'icons', 'roadmap', 'auth']
pages = '\n'.join(rd(f'pages/{n}.html') for n in order)
src = rd('preview.src.html')
for k, v in {
    '<!--CSS-->': rd('frame.css') + '\n' + rd('themes.css'),
    '<!--SPRITE-->': rd('icons.svg'),
    '<!--PAGES-->': pages,
    '<!--OVERLAYS-->': rd('pages/_overlays.html'),
    '<!--FRAMEJS-->': rd('frame.js'),
    '<!--PREVIEWJS-->': rd('preview.js').replace('/*DAISY*/[]', json.dumps([t for t in json.loads(rd('themes.json'))['themes'] if t['source'] == 'daisyui'])),
}.items():
    src = src.replace(k, v)
(d / 'preview.html').write_text(src)
print('built preview.html', len(src) // 1024, 'KB')


# ---- llms-full.txt: the whole kit in one document for agents that can only fetch a URL ----
import json, re
def llms_full():
    comps = json.loads(rd('components.json')); themes = json.loads(rd('themes.json')); icons = json.loads(rd('icons.json'))
    header = re.search(r'/\*(.*?)\*/', rd('frame.js'), re.S)
    out = ['# Frame UI: complete reference for AI agents', '',
           'Everything needed to build with Frame in one document. No Python, Node or npm. BASE = the URL this file is served from (or the folder).', '',
           '---', '## 1. Rules and workflow', rd('AGENTS.md').split('\n', 2)[2], '',
           '---', '## 2. Themes (link ONE: BASE/themes/NAME.css; every theme has light + dark via data-mode)']
    for sch in ('light', 'dark'):
        out.append(f'- natural {sch}: ' + ', '.join(t["name"] for t in themes['themes'] if t['scheme'] == sch))
    out += ['', 'Client colours: copy theme.example.css to theme.css (--color-primary, --color-primary-content, --color-accent, --color-accent-content, --neutral-hue), or paste a daisyUI theme-generator block.',
            'Tokens (daisyUI contract): ' + ', '.join(comps['tokens']), '',
            'Attributes on <html>: ' + '; '.join(f'{k}={v}' for k, v in comps['attributes']['html'].items()), '',
            '---', '## 3. Components (class, modifiers, daisyUI name, example)']
    for c in comps['components']:
        out += [f'### {c["name"]}', c['purpose'], f'- classes: {" ".join(c["frame"])}', f'- modifiers: {" ".join(c["modifiers"]) or "(none)"}', f'- daisyUI: {", ".join(c["daisyui"])}', f'- example: `{c["example"]}`' + (f'\n- a11y: {c["a11y"]}' if c.get('a11y') else ''), '']
    out += ['---', '## 4. Behaviour (frame.js, all data-attributes)', '```', header.group(1).strip('= \n') if header else '', '```', '',
            '---', '## 5. Page templates (fetch BASE/pages/NAME.html, copy the <section>)']
    out += [f'- {p["screen"]}: {p["pattern"]}' for p in comps['pages']]
    out += ['', '---', '## 6. Icons (use as <svg class="f-i"><use href="#i-NAME"/></svg>)']
    cats = {}
    for i in icons['icons']: cats.setdefault(i['category'], []).append(i['name'])
    out += [f'- {c}: ' + ' '.join(n) for c, n in cats.items()]
    out += ['', '---', '## 7. Minimal working page (starter.html)', '```html', rd('starter.html').strip(), '```', '',
            '---', '## 8. Validate', 'Add data-check to the frame.js <script> (or open the page with ?check). Console + badge list problems; Frame.check() returns them. Fix all, then remove data-check.', '']
    return '\n'.join(out)
(d / 'llms-full.txt').write_text(llms_full())
print('llms-full.txt', (d / 'llms-full.txt').stat().st_size // 1024, 'KB')

#!/usr/bin/env python3
"""Plinth checker: catches the mistakes agents (and people) make. Stdlib only.

  python3 tools/check.py FILE.html [FILE.html ...]     exit code 1 if any error

Errors:   unknown f- class · missing icon id · unknown data-theme · icon-only control with no accessible name · <img> without alt
Warnings: inline <script> blocks · daisyUI class used instead of the Plinth one (suggests the translation) · form control with no label
"""
import json, pathlib, re, sys
from html.parser import HTMLParser
ROOT = pathlib.Path(__file__).resolve().parent.parent

CSS = (ROOT / 'plinth.css').read_text()
CLASSES = set(re.findall(r'\.(f-[a-z0-9_-]+)', CSS))
ICONS = {i['name'] for i in json.loads((ROOT / 'icons.json').read_text())['icons']}
THEMES = {t['name'] for t in json.loads((ROOT / 'themes.json').read_text())['themes']}
CLIENT_CSS = ROOT / 'theme.css'
if CLIENT_CSS.exists(): THEMES |= set(re.findall(r'data-theme="([\w-]+)"', CLIENT_CSS.read_text()))
CAT = json.loads((ROOT / 'components.json').read_text()) if (ROOT / 'components.json').exists() else {}
DAISY = {d: c['frame'][0] for c in CAT.get('components', []) for d in c.get('daisyui', [])}   # btn -> f-btn

class P(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True); self.path = path; self.out = []; self.stack = []; self.labels = set(); self.fields = []
    def add(self, lvl, msg): self.out.append((lvl, self.getpos()[0], msg))
    def handle_starttag(self, tag, attrs):
        a = dict(attrs); cls = (a.get('class') or '').split()
        for c in cls:
            if c.startswith('f-') and c not in CLASSES: self.add('error', f'unknown class "{c}"')
            elif not c.startswith('f-') and c in DAISY: self.add('warn', f'daisyUI class "{c}": use "{DAISY[c]}"')
        if tag == 'use':
            h = a.get('href') or a.get('xlink:href') or ''
            if h.startswith('#i-') and h[3:] not in ICONS: self.add('error', f'icon "{h[3:]}" not in icons.json (python3 tools/icons.py add {h[3:]})')
        if tag == 'html' and a.get('data-theme') and a['data-theme'] not in THEMES: self.add('error', f'unknown data-theme "{a["data-theme"]}"')
        if tag == 'script' and not a.get('src') and a.get('type') not in ('application/json', 'application/ld+json', 'importmap'): self.add('warn', 'inline <script>: UI behaviour is data-f-* attributes (see header of plinth.js); put app logic in app.js')
        if tag == 'img' and 'alt' not in a: self.add('error', '<img> without alt')
        if tag == 'label' and a.get('for'): self.labels.add(a['for'])
        if tag in ('input', 'select', 'textarea') and a.get('type') not in ('hidden', 'submit', 'button'):
            self.fields.append((self.getpos()[0], a, bool(self.stack and 'label' in [s[0] for s in self.stack])))
        if tag not in ('input', 'img', 'br', 'hr', 'meta', 'link', 'use', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'source'):
            self.stack.append((tag, a, self.getpos()[0], {'text': False, 'svg': False}))
    def handle_data(self, d):
        if d.strip():
            for s in self.stack: s[3]['text'] = True
    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                t, a, ln, st = self.stack[i]; del self.stack[i:]
                if t in ('button', 'a') and not st['text'] and not (a.get('aria-label') or a.get('aria-labelledby') or a.get('title')) and ('class' in a) and 'data-logo' not in a:
                    self.out.append(('error', ln, f'<{t}> has no text and no aria-label'))
                break
    def finish(self):
        for ln, a, in_label in self.fields:
            if not (in_label or a.get('aria-label') or a.get('aria-labelledby') or a.get('id') in self.labels or a.get('type') in ('checkbox', 'radio') and False):
                self.out.append(('warn', ln, f'<{a.get("type","input")}> has no label (add <label for>, wrap it, or aria-label)'))

def main(files):
    errs = 0
    for f in files:
        p = P(f); p.feed(pathlib.Path(f).read_text()); p.finish()
        for lvl, ln, msg in sorted(set(p.out), key=lambda x: x[1]):
            print(f'{f}:{ln}: {lvl}: {msg}'); errs += lvl == 'error'
    print(f'{len(files)} file(s), {errs} error(s)')
    return 1 if errs else 0

if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1:]))

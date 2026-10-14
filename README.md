# faculty_recruitment
faculty recruitment test automation

# Faculty Application — XSS Security-QA Suite

> Authorized testing only — run against systems you own or have written permission to test.

## Quick start (3 commands)

```bash
./setup.sh          # installs deps + Chromium, creates .env
# edit .env to set target URL / credentials / review URLs
./run.sh --headed   # run both specs; drop --headed for headless CI
```

Or with npm: `npm run setup` then `npm test`.

---

## Layout

```
xss-suite/
├─ lib/
│  ├─ config.js      # target URLs, creds, selectors, DOM targets  ← edit this
│  ├─ payloads.js    # 76-vector XSS payload library (unique token per vector)
│  └─ helpers.js     # login/nav, field discovery, oracle, reflection classifier
├─ tests/
│  ├─ 01-form-xss.spec.js   # reflected + stored XSS, field-by-field on the form
│  └─ 02-dom-xss.spec.js    # DOM / reflected XSS via hash + query-param sinks
├─ playwright.config.js
└─ package.json
```

## Setup

```bash
cd xss-suite
npm install
npx playwright install chromium
```

## Run

```bash
npm test                 # both specs, headless
npm run test:headed      # watch it drive the browser
npm run test:form        # only the form suite (spec 01)
npm run test:dom         # only the DOM/URL suite (spec 02)
npm run report           # open the HTML report after a run
```

## Configure before first run — `lib/config.js`

- `loginUrl`, `instructionsUrl`, `email`, `password` — the target + account.
- `reviewUrls` — **important for stored XSS.** Add any preview / review /
  "my application" / admin page that *displays* submitted data. The oracle fires
  there too, so a stored payload rendering on a later page is caught.
- `domTargets`, `queryParams` — pages and parameter names probed by spec 02.
- `selectors` — comma-lists; the first visible match wins. If field auto-discovery
  misses, run `--headed` once and check the `Fields (N)` console line.

## How detection works

- **Execution oracle** — `addInitScript` hooks `alert`/`confirm`/`prompt`/`print`
  on *every* document (including post-submit and review pages), recording each
  call with the payload's unique token. A native-dialog listener is the backstop.
  This is what distinguishes a *confirmed* XSS from a mere reflection.
- **Reflection classifier** — when a payload is reflected unescaped, reports the
  context it landed in (`js-block`, `attribute`, `html-comment`, `url`, `tag`,
  `html-body`) so you know which output encoding to fix.
- **Baseline fill** — every other required field gets valid dummy data so the form
  passes validation and the payload actually reaches the server.

Each confirmed-execution result fails the run (`expect(...).toHaveLength(0)`), so
this drops into CI as a regression gate. Comment out that line for report-only runs.

## Coverage & limits (read this)

Covers: script-tag variants, every event-handler tag (img/svg/video/audio/body/
details/marquee/object/embed/iframe/input/select/textarea/keygen/form),
attribute & tag-context breakouts, JS-string breakouts, `javascript:`/`data:`/
`vbscript:` URIs, HTML-entity/decimal/hex/URL/double-URL/unicode/null-byte
encodings, obfuscation bypasses, SVG animate/set/foreignObject, mXSS mutation
vectors, framework template injection (AngularJS/Vue/`${}`), and polyglots.

Not covered: vectors needing real user interaction without autofocus
(`onmouseover` etc.); pure CSS-exfiltration / dangling-markup (no `alert` to
catch — surfaces as reflected-only at best); sinks reachable only through app
states this account can't reach. Spec 02's DOM probing is breadth-first across
common params, not a full taint analysis of the client JS.

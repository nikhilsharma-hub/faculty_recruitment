# faculty_recruitment
faculty recruitment test automation

# Faculty Application — XSS Security-QA Suite

> Authorized testing only — run against systems you own or have written permission to test.

Automated XSS testing of the IITGN faculty application portal, driven by Playwright.
The headline suite (**spec 03**) covers **every injectable field in all 10 application
sections** — Biographical, Educational Background, Employment, Publications & Patents,
Research Grants, Research, Teaching & Mentoring, Referee Information, Attachments,
and Declaration.

## Quick start

```bash
npm install
npx playwright install chromium
cp .env.example .env        # adjust target / credentials if needed
npm run test:all            # spec 03 — all sections, all fields
```

## Layout

```
lib/
  config.js     # target URLs, credentials, section→endpoint map, selectors  ← edit this
  payloads.js   # 76-vector XSS payload library (unique token per vector)
  helpers.js    # login/nav, existing-app selection, field discovery, direct-POST save,
                # rendered-HTML scan, reflection classifier, alert oracle
tests/
  03-all-sections-xss.spec.js  # ★ stored/reflected XSS across every section & field
  01-form-xss.spec.js          # legacy: single Biographical form, UI-driven
  02-dom-xss.spec.js           # DOM / reflected XSS via hash + query-param sinks
playwright.config.js
package.json
```

## Run

```bash
npm run test:all                      # spec 03, all sections (reuses last Manage Application entry)
XSS_SECTION=Referee npm run test:all  # just one section (substring match on its label)
XSS_FULL_BATTERY=1 npm run test:all   # force all 76 payloads on every field
npm run test:sqli                      # spec 04, read-only SQL injection smoke tests
npm run report                        # open the HTML report
```

(`npm test`, `npm run test:form`, `npm run test:dom` still run the legacy specs 01/02.)

## How spec 04 works

Spec 04 checks the configured faculty portal URL and selected public pages with
read-only GET requests. It places harmless quote characters in common query
parameters and checks the response for database error messages. It does not
submit forms, modify the existing application, attempt authentication bypass,
or send destructive SQL statements. Run it independently with `npm run test:sqli`.

## How spec 03 works

The application form is a **single-page Bootstrap accordion**: all 10 sections exist in
the DOM at once, and **each section is its own `<form>` with its own AJAX draft-save
endpoint** (mapped in `lib/config.js` → `sections`). For each section the test:

1. **Opens the last existing application.** The suite visits Manage Application, scrolls
   to the last editable entry, selects it, and reuses that application for every test.
   It never creates a new application. Set `XSS_APP_ID` or `XSS_APP_URL` only to pin a
   specific existing application. Date inputs use `15/10/2026` (`2026-10-15` in HTML).
2. **Saves directly to the section endpoint.** It sets a field via the DOM, builds
   `FormData(form)` and POSTs it straight to the section's ajax endpoint — exactly what
   the app's own submit handler does, minus the client-side validation gate (not a
   security control). The payload reaches and is stored by the server.
3. **Canary-gates each field.** A dangerous-char canary (`<>"'`) is saved first and the
   server-rendered page re-fetched. If the breakout chars come back **encoded**, the field
   is safe and skipped; if they survive **raw**, the field is injectable and gets the full
   76-payload battery. (`XSS_FULL_BATTERY=1` forces the battery everywhere.)
4. **Confirms execution.** Any payload that reflects unescaped in an executable context is
   re-rendered in a real browser (a separate page, alert/confirm/prompt oracle installed)
   to confirm it actually *executes* — the difference between a reflection and a confirmed
   XSS. Confirmation is bounded to one render per context per field.
5. **Restores each field** to a benign value afterwards, so stored markup never accumulates
   and corrupts the rendered form for later fields.

It **never** triggers the final-submit endpoint (`ajaxSaveAll.php`), so the application is
never finalized/locked.

### Verdicts

- **EXECUTED** — payload fired in a real browser render → confirmed stored XSS (fails the run).
- **raw-reflected** — payload stored and returned unescaped → injectable (review/fix).
- **encoded** — reflected but safely output-encoded → not exploitable in that context.

Each section is a separate Playwright test, so results (and the HTML report) are per-section,
and you can run/re-run one section at a time with `XSS_SECTION`.

## Configure — `lib/config.js`

- `loginUrl` / `manageUrl` / `instructionsUrl`, `email`, `password` — target + account.
- Existing application selection — last editable Manage Application entry by default;
  pin with `XSS_APP_ID` / `XSS_APP_URL`. `XSS_APPLICATION_DATE` controls the date
  baseline and defaults to `2026-10-15` (`15/10/2026`).
- `sections` — the section → form → save-endpoint map (already populated for this app).
- `fullBattery`, `sectionFilter` — via `XSS_FULL_BATTERY` / `XSS_SECTION`.
- `selectors` — login / start-application / edit-link selectors.

## Detection internals

- **Execution oracle** — `addInitScript` hooks `alert`/`confirm`/`prompt`/`print` on every
  document and records each call with the payload's unique token; a native-dialog listener
  is the backstop. This is what distinguishes a *confirmed* XSS from a mere reflection.
- **Rendered-HTML scan** — after each save, the server-rendered page is fetched and searched
  for the payload; the reflection classifier reports the context it landed in (`js-block`,
  `attribute`, `html-comment`, `url`, `tag`, `html-body`) so you know which output encoding to fix.

## Coverage & limits

Covers: script-tag variants, every event-handler tag, attribute & tag-context breakouts,
JS-string breakouts, `javascript:`/`data:`/`vbscript:` URIs, HTML-entity/decimal/hex/URL/
double-URL/unicode/null-byte encodings, obfuscation bypasses, SVG animate/set/foreignObject,
mXSS vectors, framework template injection, and polyglots — across every text/select/textarea
field in all 13 content forms.

Not covered: file-upload *content*/filename XSS (Attachments forms accept files only); the
Declaration checkbox; vectors needing user interaction without autofocus; and output surfaces
other than the re-rendered application form (add admin/preview/download pages to a review scan
if those display applicant data). Spec 02's DOM probing is breadth-first across common params,
not a full taint analysis of the client JS.

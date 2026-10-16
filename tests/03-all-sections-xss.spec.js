// @ts-check
/**
 * Spec 03 — Stored/Reflected XSS across ALL application sections & fields.
 *
 * The form is a single-page accordion; each of the 10 sections is its own <form>
 * with its own AJAX draft-save endpoint (see lib/config.js `sections`). For each
 * section this test:
 *   1. opens the LAST existing application (never creates a new one),
 *   2. for every injectable field, saves a dangerous-char CANARY by POSTing the
 *      form's FormData straight to the section endpoint (bypassing client-side
 *      validation, which is not a security control), then re-fetches the rendered
 *      application page to see how the value comes back,
 *   3. if the canary's breakout chars (< > " ') survive unescaped (field is
 *      injectable) — or XSS_FULL_BATTERY=1 — runs the full payload battery on it,
 *   4. for any payload that reflects unescaped in an executable context, reloads
 *      the page in a real browser (alert oracle installed) to CONFIRM execution.
 *
 * It never POSTs the final-submit endpoint, so the application is not locked.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const CONFIG = require('../lib/config');
const { makePayloads } = require('../lib/payloads');
const H = require('../lib/helpers');

const RAW_PROBE = `<>"'`;
let rnd = 0;
const nextCanary = () => { rnd++; return `QZC${Date.now().toString(36)}${rnd}`; };

// Per-section results are written here so a parallel (multi-worker) run — where each
// worker has its own module state — can be aggregated into one report afterwards.
const RESULTS_DIR = path.join(process.cwd(), 'results');
try { fs.mkdirSync(RESULTS_DIR, { recursive: true }); } catch {}

const sections = CONFIG.sections.filter(s =>
  !CONFIG.sectionFilter || s.label.toLowerCase().includes(CONFIG.sectionFilter.toLowerCase()));

const allFindings = [];

test.describe('03 — All-sections XSS (stored + reflected)', () => {
  // Sections reuse the existing application selected from Manage Application.
  test.describe.configure({ mode: 'parallel' });

  for (const section of sections) {
    test(`${section.label} [${section.form}]`, async ({ page, context }) => {
      test.setTimeout(90 * 60 * 1000);
      await H.installOracle(page);
      await H.loginAndOpenForm(page);
      const appUrl = await H.resolveApplicationUrl(page);

      const fi = await H.findFormIndex(page, section.form);
      if (fi < 0) { console.log(`[skip] form "${section.form}" not found on page`); test.skip(true, 'form not present'); return; }
      const fields = await H.discoverFormFields(page, fi);
      const payloads = makePayloads();
      console.log(`\n=== ${section.label} (form=${section.form} endpoint=${section.endpoint}) ===`);
      console.log(`Injectable fields (${fields.length}): ${fields.map(f => `${f.name}:${f.kind}`).join(', ')}`);

      // Dedicated page for execution confirmation. Reloading the (corrupted-by-markup)
      // app happens HERE, so the main `page` DOM stays fully rendered for every field.
      const confirmPage = await context.newPage();
      await H.installOracle(confirmPage);

      // Restore a field to a benign value and persist it, so stored markup never
      // accumulates and breaks the rendered form for later fields/confirmations.
      const restore = async () => {
        await H.fillFormBaseline(page, fi);
        await H.setFormField(page, fi, field.domIndex, H.benignValue(field.kind));
        await H.postSave(page, fi, section.endpoint);
      };
      var field; // referenced by restore()

      const findings = [];

      for (field of fields) {
        // ---- Canary probe: is this field output-encoded or injectable? ----
        await H.fillFormBaseline(page, fi);
        const canary = nextCanary();
        await H.setFormField(page, fi, field.domIndex, canary + RAW_PROBE);
        await H.postSave(page, fi, section.endpoint);
        const probeHtml = await H.fetchRendered(page, appUrl);
        const probe = H.scanToken(probeHtml, canary, RAW_PROBE);

        if (!probe.reflected) { await restore(); continue; }   // not shown on this surface
        if (!probe.raw && !CONFIG.fullBattery) {
          // Reflected but safely output-encoded.
          findings.push({ field: field.name, kind: field.kind, verdict: 'encoded', contexts: probe.contexts.join('|') });
          await restore();
          continue;
        }

        // ---- Field is injectable (or full battery forced): run the battery ----
        console.log(`[INJECTABLE] field="${field.name}" contexts=${probe.contexts.join('|')} — running ${payloads.length} payloads`);

        // Phase 1 — fast scan: POST each payload + GET the rendered page (no reload).
        // Raw reflection (payload survives unescaped) is itself the stored-XSS signal.
        const rawHits = [];
        await H.fillFormBaseline(page, fi);
        for (const payload of payloads) {
          await H.setFormField(page, fi, field.domIndex, payload.value);
          await H.postSave(page, fi, section.endpoint);
          const html = await H.fetchRendered(page, appUrl);
          const rawReflected = html.includes(payload.value);
          const scan = H.scanToken(html, payload.token, null);
          const context = scan.contexts[0] || (rawReflected ? 'raw' : '');
          if (rawReflected) {
            rawHits.push({ payload, context });
            findings.push({ field: field.name, kind: field.kind, verdict: 'raw-reflected',
              payload: `${payload.id}:${payload.name}`, context });
          }
        }

        // Phase 2 — confirm EXECUTION with a real render (on confirmPage, so the main
        // page DOM never reloads). Prioritise payloads that auto-fire without interaction
        // (incl. textarea/attribute breakouts), capped per field. One confirmed hit is
        // enough to mark the field vulnerable, but we record every one we catch.
        const EXEC_PRIORITY = ['img-onerror', 'img-onerror-quoted', 'svg-onload', 'svg-onload-slash',
          'attr-dq-img', 'attr-sq-svg', 'attr-dq-script', 'break-textarea', 'body-onload',
          'input-autofocus', 'details-ontoggle', 'video-source', 'audio-onerror', 'polyglot-short'];
        const rawByName = new Map();
        for (const h of rawHits) if (!rawByName.has(h.payload.name)) rawByName.set(h.payload.name, h);
        const toConfirm = EXEC_PRIORITY.map(n => rawByName.get(n)).filter(Boolean).slice(0, 8);
        let anyExec = false;
        for (const hit of toConfirm) {
          await H.fillFormBaseline(page, fi);
          await H.setFormField(page, fi, field.domIndex, hit.payload.value);
          await H.postSave(page, fi, section.endpoint);
          await confirmPage.goto(appUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
          await confirmPage.waitForTimeout(600);
          const hits = await H.readHits(confirmPage);
          if (hits.some(m => m && m.includes(hit.payload.token))) {
            anyExec = true;
            console.log(`  [EXEC-CONFIRMED] ${field.name} ${hit.payload.id}/${hit.payload.name} ctx=${hit.context}`);
            findings.push({ field: field.name, kind: field.kind, verdict: 'EXECUTED',
              payload: `${hit.payload.id}:${hit.payload.name}`, context: hit.context });
            break; // one confirmed execution is enough to flag the field
          }
        }
        console.log(`  field="${field.name}": raw-reflected=${rawHits.length}/${payloads.length}, exec-confirmed=${anyExec}`);
        await restore();
      }
      await confirmPage.close().catch(() => {});

      // ---- Section summary ----
      const executed = findings.filter(f => f.verdict === 'EXECUTED');
      const rawRef   = findings.filter(f => f.verdict === 'raw-reflected');
      const encoded  = findings.filter(f => f.verdict === 'encoded');
      console.log(`\n----- ${section.label}: ${fields.length} fields | EXECUTED=${executed.length} raw-reflected=${rawRef.length} encoded-only=${encoded.length} -----`);
      if (executed.length) console.table(executed);
      if (rawRef.length)   console.table(rawRef);
      allFindings.push({ section: section.label, findings });

      // Persist this section's results (for cross-worker aggregation / reporting).
      try {
        const safe = section.form.replace(/[^a-z0-9_]/gi, '_');
        fs.writeFileSync(path.join(RESULTS_DIR, `${safe}.json`), JSON.stringify({
          section: section.label, form: section.form, endpoint: section.endpoint, appUrl,
          fieldCount: fields.length,
          counts: { executed: executed.length, rawReflected: rawRef.length, encoded: encoded.length },
          findings,
        }, null, 2));
      } catch (e) { console.log('[warn] could not write results file: ' + e.message); }

      // Gate: any confirmed execution fails the section.
      expect(executed, `Confirmed XSS execution in "${section.label}"`).toHaveLength(0);
    });
  }

  test.afterAll(() => {
    console.log('\n==================== ALL-SECTIONS XSS SUMMARY ====================');
    for (const s of allFindings) {
      const ex = s.findings.filter(f => f.verdict === 'EXECUTED').length;
      const rr = s.findings.filter(f => f.verdict === 'raw-reflected').length;
      const en = s.findings.filter(f => f.verdict === 'encoded').length;
      console.log(`${s.section.padEnd(34)} EXECUTED=${ex}  raw-reflected=${rr}  encoded-only=${en}`);
    }
    console.log('=================================================================\n');
  });
});

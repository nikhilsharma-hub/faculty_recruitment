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
const CONFIG = require('../lib/config');
const { makePayloads } = require('../lib/payloads');
const H = require('../lib/helpers');

const RAW_PROBE = `<>"'`;
let rnd = 0;
const nextCanary = () => { rnd++; return `QZC${Date.now().toString(36)}${rnd}`; };

const sections = CONFIG.sections.filter(s =>
  !CONFIG.sectionFilter || s.label.toLowerCase().includes(CONFIG.sectionFilter.toLowerCase()));

const allFindings = [];

test.describe('03 — All-sections XSS (stored + reflected)', () => {
  for (const section of sections) {
    test(`${section.label} [${section.form}]`, async ({ page }) => {
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

      const findings = [];

      for (const field of fields) {
        // ---- Canary probe: is this field output-encoded or injectable? ----
        await H.fillFormBaseline(page, fi);
        const canary = nextCanary();
        await H.setFormField(page, fi, field.domIndex, canary + RAW_PROBE);
        await H.postSave(page, fi, section.endpoint);
        const probeHtml = await H.fetchRendered(page, appUrl);
        const probe = H.scanToken(probeHtml, canary, RAW_PROBE);

        if (!probe.reflected) { continue; }               // not shown on this surface → nothing to report here
        if (!probe.raw && !CONFIG.fullBattery) {
          // Reflected but safely output-encoded. Record as safe-reflected, move on.
          findings.push({ field: field.name, kind: field.kind, verdict: 'encoded', contexts: probe.contexts.join('|') });
          continue;
        }

        // ---- Field is injectable (or full battery forced): run the battery ----
        console.log(`[INJECTABLE] field="${field.name}" contexts=${probe.contexts.join('|')} — running ${payloads.length} payloads`);
        for (const payload of payloads) {
          await H.fillFormBaseline(page, fi);
          await H.setFormField(page, fi, field.domIndex, payload.value);
          await H.postSave(page, fi, section.endpoint);
          const html = await H.fetchRendered(page, appUrl);

          const rawReflected = html.includes(payload.value);
          const scan = H.scanToken(html, payload.token, null);
          const context = scan.contexts[0] || (rawReflected ? 'raw' : '');
          let executed = false;

          // Confirm execution for unescaped reflections in executable contexts.
          if (rawReflected || (scan.reflected && ['tag', 'attribute', 'js-block', 'html-body'].includes(context))) {
            await page.goto(appUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
            await page.waitForTimeout(400);
            const hits = await H.readHits(page);
            executed = hits.some(m => m && m.includes(payload.token));
          }

          if (executed || rawReflected) {
            console.log(`  [HIT] ${field.name} ${payload.id}/${payload.name} executed=${executed} rawReflected=${rawReflected} ctx=${context}`);
            findings.push({ field: field.name, kind: field.kind, verdict: executed ? 'EXECUTED' : 'raw-reflected',
              payload: `${payload.id}:${payload.name}`, context });
          }
        }
        // Restore the field to a benign value so the application isn't left full of markup.
        await H.fillFormBaseline(page, fi);
        await H.setFormField(page, fi, field.domIndex, H.benignValue(field.kind));
        await H.postSave(page, fi, section.endpoint);
      }

      // ---- Section summary ----
      const executed = findings.filter(f => f.verdict === 'EXECUTED');
      const rawRef   = findings.filter(f => f.verdict === 'raw-reflected');
      const encoded  = findings.filter(f => f.verdict === 'encoded');
      console.log(`\n----- ${section.label}: ${fields.length} fields | EXECUTED=${executed.length} raw-reflected=${rawRef.length} encoded-only=${encoded.length} -----`);
      if (executed.length) console.table(executed);
      if (rawRef.length)   console.table(rawRef);
      allFindings.push({ section: section.label, findings });

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

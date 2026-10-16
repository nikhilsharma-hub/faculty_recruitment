// @ts-check
/**
 * Spec 01 — Reflected & Stored XSS on the Faculty Application form.
 *
 * Flow: login -> Instructions.php -> Start Application -> application form.
 * For each testable field × each payload: baseline-fill the form, inject the
 * payload into that one field, submit, then check for execution (alert oracle)
 * and unescaped reflection (with context classification). Also re-visits any
 * configured review URLs to catch stored XSS that renders on a later page.
 */
const { test, expect } = require('@playwright/test');
const CONFIG = require('../lib/config');
const { makePayloads } = require('../lib/payloads');
const H = require('../lib/helpers');

const results = [];

test.describe('01 — Form XSS (reflected + stored)', () => {
  test.setTimeout(90 * 60 * 1000);

  test('inject full payload battery field-by-field', async ({ page }) => {
    await H.installOracle(page);
    await H.loginAndOpenForm(page);

    const fields = await H.getFields(page);
    const payloads = makePayloads();
    console.log(`\nFields (${fields.length}): ${fields.map(f => `${f.key}(${f.kind})`).join(', ')}`);
    console.log(`Payloads: ${payloads.length} | Total cases: ${fields.length * payloads.length}\n`);

    for (const field of fields) {
      for (const payload of payloads) {
        await H.openForm(page);            // reopen the same existing application
        await H.fillBaseline(page);
        await H.injectIntoField(page, field.index, payload);
        await H.submitForm(page);
        await page.waitForTimeout(350);

        let hits = await H.readHits(page);
        for (const url of CONFIG.reviewUrls) {
          await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
          await page.waitForTimeout(250);
          hits = hits.concat(await H.readHits(page));
        }
        const executed = hits.some(m => m && m.includes(payload.token));

        let reflected = false, refContext = '';
        try {
          const html = await page.content();
          if (html.includes(payload.value)) {
            reflected = true;
            refContext = H.classifyReflection(html, payload.token) || 'raw';
          } else if (html.includes(payload.token)) {
            refContext = H.classifyReflection(html, payload.token) || 'token-only';
            reflected = ['js-block', 'attribute', 'tag'].includes(refContext);
          }
        } catch {}

        if (executed || reflected) {
          console.log(`[HIT] field="${field.key}" ${payload.id}/${payload.name} executed=${executed} reflected=${reflected} ctx=${refContext}`);
        }
        results.push({ field: field.key, payloadId: payload.id, payloadName: payload.name, executed, reflected, refContext });
      }
    }

    const executedHits  = results.filter(r => r.executed);
    const reflectedHits = results.filter(r => r.reflected && !r.executed);
    console.log('\n==================== FORM XSS SUMMARY ====================');
    console.log(`Fields: ${fields.length} | Payloads: ${payloads.length} | Cases: ${results.length}`);
    console.log(`CONFIRMED execution: ${executedHits.length} | Reflected only: ${reflectedHits.length}`);
    if (executedHits.length) { console.log('\n>>> CONFIRMED XSS EXECUTION:'); console.table(executedHits.map(h => ({ field: h.field, payload: `${h.payloadId}:${h.payloadName}` }))); }
    if (reflectedHits.length) { console.log('\n>>> REFLECTED (review manually):'); console.table(reflectedHits.map(h => ({ field: h.field, payload: `${h.payloadId}:${h.payloadName}`, context: h.refContext }))); }
    if (!executedHits.length && !reflectedHits.length) console.log('No executed or unescaped-reflected payloads detected.');
    console.log('=========================================================\n');

    expect(executedHits, 'Confirmed XSS execution(s) found').toHaveLength(0);
  });
});

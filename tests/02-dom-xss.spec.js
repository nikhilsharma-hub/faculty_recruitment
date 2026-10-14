// @ts-check
/**
 * Spec 02 — DOM-based & reflected XSS via URL sinks.
 *
 * The form spec can only reach server-side handling of submitted fields.
 * This spec covers the other half: payloads delivered through the URL —
 * the hash fragment and common query parameters — which client-side code
 * may feed into sinks like innerHTML, document.write, eval, or framework
 * interpolation. Uses the same alert oracle to confirm execution.
 */
const { test, expect } = require('@playwright/test');
const CONFIG = require('../lib/config');
const { makePayloads } = require('../lib/payloads');
const H = require('../lib/helpers');

const results = [];

// A focused subset well-suited to URL delivery (hash/query), to keep the matrix sane.
const urlPayloadNames = new Set([
  'img-onerror', 'svg-onload', 'script-basic', 'attr-dq-img', 'attr-dq-focus',
  'input-autofocus', 'url-javascript', 'url-js-mixedcase', 'enc-url', 'enc-html-entity',
  'ng-constructor', 'vue-c-constructor', 'polyglot-short', 'details-ontoggle', 'iframe-srcdoc',
]);

test.describe('02 — DOM / URL-sink XSS', () => {
  test.setTimeout(60 * 60 * 1000);

  test('probe hash and query-param sinks', async ({ page }) => {
    await H.installOracle(page);
    await H.loginOnly(page);

    const payloads = makePayloads().filter(p => urlPayloadNames.has(p.name));
    const targets = CONFIG.domTargets;
    const params = CONFIG.queryParams;
    console.log(`\nDOM targets: ${targets.length} | params: ${params.length} | payloads: ${payloads.length}`);
    console.log(`Cases: ${targets.length * payloads.length * (1 + params.length)}\n`);

    const probe = async (url, label, payload) => {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
        // trigger hashchange/route handlers and any focus-based vectors
        await page.evaluate(() => { try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch {} }).catch(() => {});
        await page.waitForTimeout(300);
        const hits = await H.readHits(page);
        const executed = hits.some(m => m && m.includes(payload.token));

        let reflected = false, refContext = '';
        try {
          const html = await page.content();
          if (html.includes(payload.value)) { reflected = true; refContext = H.classifyReflection(html, payload.token) || 'raw'; }
        } catch {}

        if (executed || reflected) {
          console.log(`[HIT] ${label} ${payload.id}/${payload.name} executed=${executed} reflected=${reflected} ctx=${refContext}`);
        }
        results.push({ target: label, payloadId: payload.id, payloadName: payload.name, executed, reflected, refContext });
      } catch {}
    };

    for (const base of targets) {
      for (const payload of payloads) {
        const enc = encodeURIComponent(payload.value);
        // 1) hash fragment
        await probe(`${base}#${enc}`, `${base}#<frag>`, payload);
        // 2) each query parameter
        for (const p of params) {
          const sep = base.includes('?') ? '&' : '?';
          await probe(`${base}${sep}${p}=${enc}`, `${base}?${p}=`, payload);
        }
      }
    }

    const executedHits  = results.filter(r => r.executed);
    const reflectedHits = results.filter(r => r.reflected && !r.executed);
    console.log('\n==================== DOM/URL XSS SUMMARY ====================');
    console.log(`Cases: ${results.length} | CONFIRMED execution: ${executedHits.length} | Reflected only: ${reflectedHits.length}`);
    if (executedHits.length) { console.log('\n>>> CONFIRMED XSS EXECUTION:'); console.table(executedHits.map(h => ({ target: h.target, payload: `${h.payloadId}:${h.payloadName}` }))); }
    if (reflectedHits.length) { console.log('\n>>> REFLECTED (review manually):'); console.table(reflectedHits.map(h => ({ target: h.target, payload: `${h.payloadId}:${h.payloadName}`, context: h.refContext }))); }
    if (!executedHits.length && !reflectedHits.length) console.log('No executed or unescaped-reflected payloads detected.');
    console.log('============================================================\n');

    expect(executedHits, 'Confirmed DOM/URL XSS execution(s) found').toHaveLength(0);
  });
});

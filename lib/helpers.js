// @ts-check
/**
 * Shared helpers: login/navigation, field discovery, baseline fill,
 * injection, submit, the execution oracle, and reflection classification.
 */
const CONFIG = require('./config');
const S = CONFIG.selectors;

async function firstVisible(page, selectorList) {
  for (const sel of selectorList.split(',').map(s => s.trim())) {
    const loc = page.locator(sel).first();
    try { if (await loc.count() && await loc.isVisible()) return loc; } catch {}
  }
  return null;
}

/**
 * Install the execution oracle on EVERY document (incl. post-submit / stored pages).
 * Hooks alert/confirm/prompt/print and records each call into window.__xssHits.
 * Also attaches a native-dialog backstop.
 */
async function installOracle(page) {
  await page.addInitScript(() => {
    window.__xssHits = window.__xssHits || [];
    const rec = () => function () { try { window.__xssHits.push(String(arguments[0])); } catch (e) {} return undefined; };
    try { window.alert = rec(); } catch (e) {}
    try { window.confirm = rec(); } catch (e) {}
    try { window.prompt = rec(); } catch (e) {}
    try { window.print = rec(); } catch (e) {}
  });
  page.on('dialog', async (d) => {
    try { await page.evaluate((m) => { (window.__xssHits = window.__xssHits || []).push(m); }, d.message()); } catch {}
    await d.dismiss().catch(() => {});
  });
}

/** Read + clear execution hits recorded on the current document. */
async function readHits(page) {
  try {
    return await page.evaluate(() => {
      const h = (window.__xssHits || []).slice();
      window.__xssHits = [];
      return h;
    });
  } catch { return []; }
}

/**
 * Ensure the session is authenticated. Idempotent: if the login fields aren't
 * present (already logged in — the app no longer renders them), this is a no-op.
 * Returns true if it performed a fresh login, false if already authenticated.
 */
async function ensureLoggedIn(page) {
  await page.goto(CONFIG.loginUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  const emailEl = await firstVisible(page, S.email);
  const passEl  = await firstVisible(page, S.password);
  if (!emailEl || !passEl) return false; // already logged in
  await emailEl.fill(CONFIG.email);
  await passEl.fill(CONFIG.password);
  const loginBtn = await firstVisible(page, S.loginSubmit);
  // Submit robustly (concurrent workers can make a plain click time out): prefer
  // Enter, fall back to a click with a generous timeout.
  try {
    if (loginBtn) await loginBtn.click({ timeout: 30000 });
    else await passEl.press('Enter');
  } catch { await passEl.press('Enter').catch(() => {}); }
  await page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
  return true;
}

// Cached, resolved application form URL (so we don't hit Manage every navigation).
let _appUrl = '';

/**
 * Select the last editable application from Manage Application.
 * The link is scrolled into view and clicked so this follows the same workflow
 * as a user selecting the last row, rather than creating a new application.
 */
async function selectLastApplication(page) {
  await page.goto(CONFIG.manageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});

  const links = page.locator('a');
  const matches = [];
  for (let i = 0; i < await links.count(); i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');
    const match = (href || '').match(/facultyapply\/(\d+)/);
    const label = `${await link.textContent() || ''} ${await link.getAttribute('class') || ''}`;
    if (match && /edit/i.test(label)) matches.push({ link, id: parseInt(match[1], 10) });
  }
  matches.sort((a, b) => a.id - b.id);
  const last = matches[matches.length - 1];
  if (!last) throw new Error('No editable application found in Manage Application — cannot select a test application.');

  await last.link.scrollIntoViewIfNeeded();
  await last.link.click();
  await page.waitForLoadState('domcontentloaded', { timeout: 45000 }).catch(() => {});
  const selectedUrl = page.url();
  if (!/facultyapply\/\d+/.test(selectedUrl)) {
    throw new Error(`Manage Application did not open the last editable application (id ${last.id}).`);
  }
  return selectedUrl;
}

/**
 * Resolve the application to test, caching the result for the rest of the run.
 * Explicit CONFIG.appUrl wins; otherwise the last Manage Application entry is
 * selected and reused. No test path creates a new application.
 */
async function resolveApplicationUrl(page) {
  if (_appUrl) return _appUrl;
  if (CONFIG.appUrl) {
    _appUrl = CONFIG.appUrl;
    console.log(`[nav] Using pinned application: ${_appUrl}`);
    return _appUrl;
  }
  _appUrl = await selectLastApplication(page);
  console.log(`[nav] Reusing LAST application selected in Manage Application: ${_appUrl}`);
  return _appUrl;
}

/** Navigate to the application form (the last existing application; assumes logged in). */
async function openForm(page) {
  const url = await resolveApplicationUrl(page);
  await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
  // The edit view injects the accordion section forms asynchronously. Wait until
  // the page is fully built (last section/tab present) before anything reads it,
  // otherwise field discovery races a half-rendered form (missing sections).
  await page.waitForSelector('#declartaionTab, a.submitBtn, a:has-text("Submit Application")', { timeout: 20000 }).catch(() => {});
  await waitForFormsReady(page);
  const form = await firstVisible(page, S.form);
  if (!form) throw new Error(`Application form not found at ${url} — check XSS_APP_ID / selectors.form.`);
  return true;
}

/** Wait until the number of <form> elements stabilises (async section injection settled). */
async function waitForFormsReady(page, { stableMs = 800, timeout = 20000 } = {}) {
  const start = Date.now();
  let last = -1, lastChange = Date.now();
  while (Date.now() - start < timeout) {
    const n = await page.evaluate(() => document.querySelectorAll('form').length).catch(() => 0);
    if (n !== last) { last = n; lastChange = Date.now(); }
    else if (Date.now() - lastChange >= stableMs && n >= 10) return n; // stable and plausibly complete
    await page.waitForTimeout(200);
  }
  return last;
}

/** Log in (if needed) and land on the existing application form. */
async function loginAndOpenForm(page) {
  await ensureLoggedIn(page);
  await openForm(page);
  return true;
}

/** Log in only (no form navigation) — used by the DOM-XSS spec. */
async function loginOnly(page) {
  await ensureLoggedIn(page);
}

async function getFields(page) {
  const form = (await firstVisible(page, S.form)) || page;
  const handles = await form.locator(
    'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]), textarea, select'
  ).elementHandles();
  const fields = [];
  let i = 0;
  for (const h of handles) {
    const tag  = await h.evaluate(e => e.tagName.toLowerCase());
    const type = (await h.evaluate(e => e.getAttribute('type') || '')).toLowerCase();
    const name = await h.evaluate(e => e.getAttribute('name') || e.getAttribute('id') || '');
    if (await h.evaluate(e => e.disabled) || await h.evaluate(e => e.readOnly === true)) continue;
    fields.push({
      key: name || `${tag}[${i}]`,
      kind: tag === 'select' ? 'select' : (tag === 'textarea' ? 'textarea' : (type || 'text')),
      index: i,
    });
    i++;
  }
  return fields;
}

function benignValue(kind) {
  switch (kind) {
    case 'email':    return 'tester@example.com';
    case 'tel':      return '9876543210';
    case 'number':   return '25';
    case 'date':     return CONFIG.applicationDate;
    case 'url':      return 'https://example.com';
    case 'password': return 'Valid@1234';
    default:         return 'QA Baseline Value';
  }
}

/**
 * Fill every field with valid dummy data in a SINGLE in-browser pass.
 * Setting values via the DOM (and dispatching input/change) avoids Playwright's
 * per-element actionability waits, which otherwise block ~15s on each hidden /
 * conditional field. Hidden fields still get valid values so the form validates
 * and the injected payload reaches the server.
 */
async function fillBaseline(page) {
  const formLoc = await firstVisible(page, S.form);
  const target = formLoc || page.locator('body');
  await target.evaluate((root, applicationDate) => {
    const benign = (type) => ({
      email: 'tester@example.com', tel: '9876543210', number: '25',
      date: applicationDate, url: 'https://example.com', password: 'Valid@1234',
    }[type] || 'QA Baseline Value');
    const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };

    root.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea')
      .forEach((el) => { el.value = benign((el.getAttribute('type') || '').toLowerCase()); fire(el); });

    root.querySelectorAll('select').forEach((sel) => {
      const opt = Array.from(sel.options).find(o => o.value !== '');
      if (opt) { sel.value = opt.value; fire(sel); }
    });

    root.querySelectorAll('input[type=checkbox]').forEach((el) => { el.checked = true; fire(el); });

    const seen = new Set();
    root.querySelectorAll('input[type=radio]').forEach((el) => {
      if (seen.has(el.name)) return; seen.add(el.name);
      el.checked = true; fire(el);
    });
  }, CONFIG.applicationDate);
}

async function injectIntoField(page, fieldIndex, payload) {
  const form = (await firstVisible(page, S.form)) || page;
  const el = form.locator('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]), textarea, select').nth(fieldIndex);
  const tag = await el.evaluate(e => e.tagName.toLowerCase());
  if (tag === 'select') {
    await el.evaluate((sel, val) => {
      const opt = document.createElement('option');
      opt.value = val; opt.textContent = val; opt.selected = true;
      sel.appendChild(opt); sel.dispatchEvent(new Event('change', { bubbles: true }));
    }, payload.value);
  } else {
    // Prefer a real fill (visible fields); fall back to a direct DOM set for
    // hidden/conditional fields so we never block on actionability (~15s).
    try {
      await el.fill('', { timeout: 3000 });
      await el.fill(payload.value, { timeout: 3000 });
    } catch {
      await el.evaluate((node, val) => {
        node.value = val;
        node.dispatchEvent(new Event('input', { bubbles: true }));
        node.dispatchEvent(new Event('change', { bubbles: true }));
      }, payload.value);
    }
  }
}

async function submitForm(page) {
  const btn = await firstVisible(page, S.formSubmit);
  if (btn) await Promise.all([ page.waitForLoadState('load', { timeout: 4000 }).catch(() => {}), btn.click().catch(() => {}) ]);
}

/** Classify where a reflected token landed in the HTML. */
function classifyReflection(html, token) {
  const i = html.indexOf(token);
  if (i < 0) return null;
  const pre = html.slice(Math.max(0, i - 400), i);
  const lastOpenScript  = pre.lastIndexOf('<script');
  const lastCloseScript = pre.lastIndexOf('</script');
  const lastComment     = pre.lastIndexOf('<!--');
  const lastCommentEnd  = pre.lastIndexOf('-->');
  if (lastOpenScript > lastCloseScript) return 'js-block';
  if (lastComment > lastCommentEnd)     return 'html-comment';
  const tail = pre.slice(-80);
  if (/=["'][^"']*$/.test(tail)) return 'attribute';
  if (/https?:\/\/[^\s"'<>]*$/.test(tail) || /(href|src)\s*=\s*$/i.test(tail)) return 'url';
  if (/<[^>]*$/.test(tail)) return 'tag';
  return 'html-body';
}

// ---------------------------------------------------------------------------
// Section-aware helpers — for the multi-form accordion. Each <form> is one
// section with its own AJAX Save button. All operate in-page by form index +
// field DOM-index, so they work even while a section's accordion panel is
// collapsed (hidden), avoiding Playwright actionability waits entirely.
// ---------------------------------------------------------------------------

const INJECTABLE_SEL =
  'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea, select';

/** Index (in document form order) of the form whose id — or else name — matches key.
 *  Polls briefly, since section forms can be injected asynchronously after load. */
async function findFormIndex(page, key, timeout = 12000) {
  const start = Date.now();
  for (;;) {
    const idx = await page.evaluate((k) => {
      const forms = Array.from(document.querySelectorAll('form'));
      const byId = forms.findIndex(f => f.id === k);
      if (byId >= 0) return byId;
      return forms.findIndex(f => (f.getAttribute('name') || '') === k);
    }, key);
    if (idx >= 0 || Date.now() - start >= timeout) return idx;
    await page.waitForTimeout(250);
  }
}

/** Injectable fields of one form: [{ domIndex, name, kind }]. domIndex is the
 *  position within the form's full input/select/textarea list (stable, unambiguous). */
async function discoverFormFields(page, formIndex) {
  return await page.evaluate((fi) => {
    const form = document.querySelectorAll('form')[fi];
    if (!form) return [];
    const all = Array.from(form.querySelectorAll('input,select,textarea'));
    const out = [];
    all.forEach((el, di) => {
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (tag === 'input' && ['hidden', 'submit', 'button', 'reset', 'file', 'checkbox', 'radio'].includes(type)) return;
      const name = el.getAttribute('name') || el.id || '';
      if (!name) return; // skip decorative/nameless inputs
      const kind = tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : (type || 'text');
      out.push({ domIndex: di, name, kind });
    });
    return out;
  }, formIndex);
}

/** Baseline-fill one form with valid dummy data (single in-browser pass). */
async function fillFormBaseline(page, formIndex) {
  await page.evaluate(({ formIndex, applicationDate }) => {
    const form = document.querySelectorAll('form')[formIndex];
    if (!form) return;
    const benign = (t) => ({ email: 'tester@example.com', tel: '9876543210', number: '25',
      date: applicationDate, url: 'https://example.com', password: 'Valid@1234' }[t] || 'QA Baseline Value');
    const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    form.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea')
      .forEach((el) => { el.value = benign((el.getAttribute('type') || '').toLowerCase()); fire(el); });
    form.querySelectorAll('select').forEach((sel) => { const o = Array.from(sel.options).find(x => x.value !== ''); if (o) { sel.value = o.value; fire(sel); } });
    form.querySelectorAll('input[type=checkbox]').forEach((el) => { el.checked = true; fire(el); });
    const seen = new Set();
    form.querySelectorAll('input[type=radio]').forEach((el) => { if (seen.has(el.name)) return; seen.add(el.name); el.checked = true; fire(el); });
  }, { formIndex, applicationDate: CONFIG.applicationDate });
}

/** Set one field (by form index + DOM index) to a value; selects get an injected option. */
async function setFormField(page, formIndex, domIndex, value) {
  await page.evaluate(({ fi, di, val }) => {
    const form = document.querySelectorAll('form')[fi];
    if (!form) return;
    const el = form.querySelectorAll('input,select,textarea')[di];
    if (!el) return;
    if (el.tagName.toLowerCase() === 'select') {
      let opt = Array.from(el.options).find(o => o.value === val);
      if (!opt) { opt = document.createElement('option'); opt.value = val; opt.textContent = val; el.appendChild(opt); }
      el.value = val;
    } else {
      el.value = val;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { fi: formIndex, di: domIndex, val: value });
}

/**
 * Trigger one form's Save in-page. Clicking the submit button via JS fires the
 * app's bound AJAX save handler even when the section is collapsed/hidden.
 * Never triggers the final application submit.
 */
async function saveForm(page, formIndex, waitMs = 500) {
  await page.evaluate((fi) => {
    const form = document.querySelectorAll('form')[fi];
    if (!form) return;
    const btn = form.querySelector('button[type=submit], input[type=submit]');
    try { if (btn) btn.click(); else if (form.requestSubmit) form.requestSubmit(); else form.submit(); }
    catch (e) { try { if (form.requestSubmit) form.requestSubmit(); } catch (e2) {} }
  }, formIndex);
  await page.waitForLoadState('load', { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(waitMs);
}

/** The app's base URL for ajax endpoints (read from window.js_site_base_url). */
async function siteBaseUrl(page) {
  return await page.evaluate(() =>
    (typeof js_site_base_url !== 'undefined' && js_site_base_url) || (location.origin + '/faculty/'));
}

/**
 * Save a section by POSTing its FormData directly to its ajax endpoint — exactly
 * what the app's submitHandler does, minus the client-validation gate (not a
 * security control). Carries the session cookies and the form's hidden app id.
 * Returns { status, body }.
 */
async function postSave(page, formIndex, endpoint) {
  const base = await siteBaseUrl(page);
  return await page.evaluate(async ({ fi, url }) => {
    const form = document.querySelectorAll('form')[fi];
    if (!form) return { status: 0, body: '(form not found)' };
    try {
      const r = await fetch(url, { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
      return { status: r.status, body: (await r.text()).slice(0, 2000) };
    } catch (e) { return { status: -1, body: 'fetch error: ' + e.message }; }
  }, { fi: formIndex, url: base + 'ajax/' + endpoint });
}

/** Fetch server-rendered HTML of a URL using the browser's session (no JS execution). */
async function fetchRendered(page, url) {
  try { const r = await page.request.get(url); return await r.text(); } catch { return ''; }
}

/**
 * Find every occurrence of `token` in html and classify each. Returns
 * { reflected, raw, contexts } where raw=true means the dangerous breakout
 * chars (< > " ') survived unescaped next to the token (i.e. injectable).
 */
function scanToken(html, token, rawProbe) {
  const contexts = [];
  let raw = false, reflected = false, from = 0, i;
  while ((i = html.indexOf(token, from)) >= 0) {
    reflected = true;
    const ctx = classifyReflection(html, token) || 'html-body';
    contexts.push(ctx);
    // Did the raw breakout chars survive right after the token?
    if (rawProbe && html.substr(i, token.length + rawProbe.length).includes(token + rawProbe)) raw = true;
    const slot = html.substr(i + token.length, 12);
    if (/[<>"']/.test(slot)) raw = true;
    from = i + token.length;
  }
  return { reflected, raw, contexts: Array.from(new Set(contexts)) };
}

module.exports = {
  firstVisible, installOracle, readHits, ensureLoggedIn, openForm, loginAndOpenForm, loginOnly,
  resolveApplicationUrl, selectLastApplication, waitForFormsReady, getFields, benignValue, fillBaseline, injectIntoField, submitForm, classifyReflection,
  INJECTABLE_SEL, findFormIndex, discoverFormFields, fillFormBaseline, setFormField, saveForm,
  siteBaseUrl, postSave, fetchRendered, scanToken,
};

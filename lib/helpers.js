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
  await page.goto(CONFIG.loginUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  const emailEl = await firstVisible(page, S.email);
  const passEl  = await firstVisible(page, S.password);
  if (!emailEl || !passEl) return false; // already logged in
  await emailEl.fill(CONFIG.email);
  await passEl.fill(CONFIG.password);
  const loginBtn = await firstVisible(page, S.loginSubmit);
  if (loginBtn) await loginBtn.click(); else await passEl.press('Enter');
  await page.waitForLoadState('load', { timeout: 4000 }).catch(() => {});
  return true;
}

/** Navigate to a fresh, empty copy of the application form (assumes logged in). */
async function openForm(page) {
  await page.goto(CONFIG.instructionsUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
  const startBtn = await firstVisible(page, S.startApplication);
  if (startBtn) { await startBtn.click(); await page.waitForLoadState('load', { timeout: 4000 }).catch(() => {}); }

  const form = await firstVisible(page, S.form);
  if (!form) throw new Error('Application form not found — adjust selectors.startApplication / .form in lib/config.js');
  return true;
}

/** Log in (if needed) and land on a fresh application form. */
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
    case 'date':     return '1990-01-01';
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
  await target.evaluate((root) => {
    const benign = (type) => ({
      email: 'tester@example.com', tel: '9876543210', number: '25',
      date: '1990-01-01', url: 'https://example.com', password: 'Valid@1234',
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
  });
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

module.exports = {
  firstVisible, installOracle, readHits, ensureLoggedIn, openForm, loginAndOpenForm, loginOnly,
  getFields, benignValue, fillBaseline, injectIntoField, submitForm, classifyReflection,
};

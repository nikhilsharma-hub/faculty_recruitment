// @ts-check
/**
 * Spec 04 — non-destructive SQL-injection smoke tests.
 *
 * This spec only performs GET requests against approved faculty portal pages.
 * It does not submit forms, alter an application, attempt authentication bypass,
 * or send destructive SQL statements.
 */
const { test, expect } = require('@playwright/test');
const CONFIG = require('../lib/config');
const H = require('../lib/helpers');

const SQL_ERROR_PATTERNS = [
  /SQL syntax.*MySQL/i,
  /mysqli?_query/i,
  /PDOException/i,
  /PostgreSQL.*ERROR/i,
  /SQLite3::/i,
  /odbc_exec/i,
  /Microsoft OLE DB Provider for SQL Server/i,
  /Unclosed quotation mark/i,
  /You have an error in your SQL syntax/i,
];

const PROBES = [
  { name: 'single-quote', value: "'" },
  { name: 'double-quote', value: '"' },
  { name: 'quoted-parenthesis', value: "')"},
];

const PARAMS = ['q', 'search', 'id', 'page', 'keyword'];

function assertAllowedTarget(rawUrl) {
  const target = new URL(rawUrl);
  const origin = new URL(CONFIG.loginUrl).origin;
  if (target.origin !== origin || !target.pathname.startsWith('/faculty/')) {
    throw new Error(`SQLi target is outside the approved faculty origin: ${rawUrl}`);
  }
  return target;
}

function hasDatabaseError(body) {
  return SQL_ERROR_PATTERNS.some((pattern) => pattern.test(body));
}

async function readPage(page, url) {
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  }).catch(() => null);
  await page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
  return {
    status: response ? response.status() : 0,
    body: await page.content().catch(() => ''),
    finalUrl: page.url(),
  };
}

test.describe('04 — SQL injection smoke tests', () => {
  test.setTimeout(10 * 60 * 1000);

  test('rejects database-error leakage from query parameters', async ({ page }) => {
    await H.loginOnly(page);

    const findings = [];
    for (const rawTarget of CONFIG.sqliTargets) {
      const target = assertAllowedTarget(rawTarget);
      const baseline = await readPage(page, target.toString());
      expect(baseline.status, `baseline request failed for ${target}`).toBeGreaterThan(0);

      for (const param of PARAMS) {
        for (const probe of PROBES) {
          const probeUrl = new URL(target);
          probeUrl.searchParams.set(param, probe.value);
          const result = await readPage(page, probeUrl.toString());
          const databaseError = hasDatabaseError(result.body);
          const statusChanged = result.status !== baseline.status;

          console.log(
            `[SQLi] ${target.pathname}?${param} ${probe.name} ` +
            `status=${result.status} baseline=${baseline.status} ` +
            `databaseError=${databaseError} statusChanged=${statusChanged}`,
          );

          if (databaseError) {
            findings.push({
              target: target.toString(),
              parameter: param,
              probe: probe.name,
              status: result.status,
              finalUrl: result.finalUrl,
            });
          }
        }
      }
    }

    expect(findings, 'Database error signatures indicate possible SQL injection').toEqual([]);
  });
});

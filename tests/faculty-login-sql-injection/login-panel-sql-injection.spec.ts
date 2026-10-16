import { test, expect, type APIResponse, type Page } from '@playwright/test';

const loginUrl = 'http://10.0.62.109:8081/faculty/login.php';
const runDestructiveSqli = process.env.RUN_DESTRUCTIVE_SQLI === 'true';

const contextProbes = ["'", "''", '\\'];
const authenticationBypassProbes = [
  "' OR '1'='1' -- -", "' OR '1'='1' #", "' OR 1=1 LIMIT 1 -- -",
  "admin' -- -", "admin' #", "') OR ('1'='1' -- -", "' OR 1=1 OR ''='",
  "' OR 'x'='x", "' OR 'a'='a", "') OR ('1'='1", "') OR ('1'='1' --",
  "') OR '1'='1' --", "' OR 1=1 LIMIT 1 --", "' OR 1=1 LIMIT 1 #",
  "admin') --", "admin') #", "admin')/*", "' OR username LIKE '%admin%' --",
  "' OR 1=1 OR ''='", "1' OR '1'='1", "x' OR 1=1 --",
  '" OR "1"="1" --', '" OR "1"="1" #', '") OR ("1"="1',
  '") OR ("1"="1" --', 'admin" --', 'admin" #', '" OR 1=1 LIMIT 1 --',
  "'OR'1'='1'--", "'OR(1=1)--", "'OR/**/1=1--", "'/**/OR/**/1=1/**/--",
  "'%09OR%091=1--", "'%0aOR%0a1=1--", "'+OR+1=1--", "' OR 1=1-- -",
  "' OR 1=1;%00", "' OR 1=1/*comment*/--", "admin'-- -",
];
const booleanPairs = [
  ["' AND 1=1 -- -", "' AND 1=2 -- -"],
  ["' AND 'a'='a", "' AND 'a'='b"],
  ["' AND substring(@@version,1,1)='5' --", "' AND substring(@@version,1,1)='x' --"],
] as const;
const structuralAndErrorProbes = [
  "' ORDER BY 1 -- -", "' ORDER BY 2 -- -", "' ORDER BY 3 -- -", "' ORDER BY 4 -- -",
  "' ORDER BY 10 -- -", "' GROUP BY 1,2,3 --", "' UNION SELECT NULL -- -",
  "' UNION SELECT NULL,NULL -- -", "' UNION SELECT NULL,NULL,NULL -- -",
  "' UNION SELECT @@version,NULL,NULL -- -", "' UNION SELECT user(),database(),NULL -- -",
  "' UNION SELECT NULL --", "' UNION SELECT NULL,NULL --",
  "' UNION SELECT NULL,NULL,NULL,NULL --", "' UNION SELECT NULL,NULL,NULL,NULL,NULL --",
  "' UNION ALL SELECT 1,2,3 --", "' AND extractvalue(1,concat(0x7e,version())) -- -",
  "' AND extractvalue(1,concat(0x7e,(SELECT database()))) -- -",
  "' AND updatexml(1,concat(0x7e,version()),1) -- -",
  "' AND 1=CONVERT(int,(SELECT @@version)) --", "' AND 1=CAST((SELECT version()) AS int) --",
];
const destructiveProbes = [
  "' OR SLEEP(5) -- -", "' AND SLEEP(5) -- -", "' OR IF(1=1,SLEEP(5),0) -- -",
  "' AND (SELECT 1 FROM (SELECT SLEEP(5))x) -- -", "' OR BENCHMARK(5000000,MD5(1)) -- -",
  "' OR pg_sleep(5) -- -", "'; SELECT pg_sleep(5) -- -", "' AND (SELECT 1 FROM pg_sleep(5)) -- -",
  "'; WAITFOR DELAY '0:0:5' -- -", "' OR 1=1; WAITFOR DELAY '0:0:5' -- -",
  "' OR 1=DBMS_PIPE.RECEIVE_MESSAGE('a',5) -- -",
  "' AND 1=randomblob(100000000) -- -", "' AND 1=like('a',randomblob(10000000)) -- -",
];
const disclosure = /sql syntax|mysql|mariadb|postgres(?:ql)?|mssql|oracle|sqlite|@@version|version\(\)|database\(\)|information_schema|stack trace|fatal error|uncaught exception|warning:.*line \d+/i;

async function postLoginProbe(page: Page, email: string, password: string): Promise<APIResponse> {
  await page.goto(loginUrl);
  const token = await page.locator('input[name="token"]').inputValue();
  return page.context().request.post(loginUrl, {
    form: { uemail: email, upassword: password, token, cmd_submit: 'Login' },
    timeout: 10_000,
  });
}

async function safeResponseBody(response: APIResponse): Promise<string> {
  const body = await response.text();
  expect(response.status(), 'SQL injection input must not cause a server error').toBeLessThan(500);
  expect(response.url()).toContain('/faculty/login.php');
  expect(body).not.toMatch(disclosure);
  return body;
}

test.describe('Faculty Login Panel SQL Injection Security', () => {
  test('Rejects supplied SQL-injection payloads without authentication or disclosure', async ({ page }) => {
    // 1. Open the login panel and verify its controls.
    await page.goto(loginUrl);
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // 2. Send injection-context probes in Email.
    for (const probe of contextProbes) {
      await safeResponseBody(await postLoginProbe(page, probe, 'invalid-password'));
    }

    // 3. Send authentication-bypass probes in Email and Password.
    for (const probe of authenticationBypassProbes) {
      await safeResponseBody(await postLoginProbe(page, probe, 'invalid-password'));
      await safeResponseBody(await postLoginProbe(page, 'invalid@example.com', probe));
    }

    // 4. Compare boolean true/false pairs without relying on timing.
    for (const [trueProbe, falseProbe] of booleanPairs) {
      const trueBody = await safeResponseBody(await postLoginProbe(page, trueProbe, 'invalid-password'));
      const falseBody = await safeResponseBody(await postLoginProbe(page, falseProbe, 'invalid-password'));
      expect(trueBody, 'Boolean probes must not expose a response oracle').toBe(falseBody);
    }

    // 5. Send ORDER BY, UNION, and error-based probes.
    for (const probe of structuralAndErrorProbes) {
      await safeResponseBody(await postLoginProbe(page, probe, 'invalid-password'));
    }

    // 6. Run time/resource-intensive probes only with explicit authorization.
    if (runDestructiveSqli) {
      for (const probe of destructiveProbes) {
        await safeResponseBody(await postLoginProbe(page, probe, 'invalid-password'));
      }
    }

    // 7. Verify Remember Me does not preserve a rejected injection session.
    await page.goto(loginUrl);
    await page.getByRole('checkbox').check();
    await safeResponseBody(await postLoginProbe(page, "' OR '1'='1' -- -", 'invalid-password'));
    expect((await page.context().cookies()).some(cookie => /remember|auth|session/i.test(cookie.name) && cookie.value.length > 0)).toBe(false);

    // 8. Verify a normal invalid login still returns to the login panel.
    await page.goto(loginUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('invalid-password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(loginUrl);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});

# Faculty Login Panel - SQL Injection Security Test Plan

## Application Overview

Security-focused test plan for the faculty login panel at http://10.0.62.109:8081/faculty/login.php. Scope is limited to the Email and Password inputs, the Remember Me option, and the Login submission flow. Tests must be run only against the authorized test environment using non-destructive payloads and test accounts; do not use production credentials or destructive SQL statements. Each case assumes a fresh browser state and should be independently reset to the login page before execution.

## Test Scenarios

### 1. Faculty login SQL injection security

**Seed:** `tests/seed.spec.ts`

#### 1.1. Reject classic authentication-bypass payload in the Email field

**File:** `tests/faculty-login-sql-injection/authentication-bypass-email.spec.ts`

**Steps:**
  1. Start from a fresh browser context on http://10.0.62.109:8081/faculty/login.php. Confirm the Email and Password fields are empty and no authenticated session exists.
    - expect: The faculty login panel is displayed.
    - expect: No faculty dashboard or authenticated session is present.
  2. Enter a syntactically valid-looking SQL authentication-bypass probe such as ' OR '1'='1' -- in Email, enter any non-empty value such as invalid-password in Password, leave Remember Me unchecked, and click Login.
    - expect: The application does not authenticate the user.
    - expect: The user remains on the login flow or receives a generic invalid-credentials response.
    - expect: No faculty dashboard, session cookie, account data, or privileged response is returned.
  3. Repeat the same test with the comment variant ' OR 1=1# in Email and a non-empty arbitrary password.
    - expect: The result remains unauthenticated and consistent with the prior attempt.
    - expect: No SQL error, database traceback, query text, or stack trace is exposed.
  4. Record the HTTP status, visible message, redirect target, cookies, and response behavior for both attempts.
    - expect: Responses do not disclose whether the payload altered query logic.
    - expect: Any failure message is generic and does not enumerate users or database details.

#### 1.2. Reject authentication-bypass payload in the Password field

**File:** `tests/faculty-login-sql-injection/authentication-bypass-password.spec.ts`

**Steps:**
  1. Reset to the fresh faculty login page with no active session. Enter a non-existent or approved test email in Email.
    - expect: The Email field accepts the test value without creating a session.
  2. Enter ' OR '1'='1' -- in Password and click Login.
    - expect: Authentication fails.
    - expect: No privileged page, dashboard, session, or user profile is accessible.
  3. Repeat with the password probes "' OR 1=1#" and "') OR ('1'='1" using the same test email.
    - expect: All probes are handled as data, not executable SQL.
    - expect: No database error details or SQL syntax are disclosed.
    - expect: The response behavior does not vary in a way that reveals query structure or account validity.

#### 1.3. Prevent error-based and blind SQL injection disclosure

**File:** `tests/faculty-login-sql-injection/error-based-and-blind-probes.spec.ts`

**Steps:**
  1. From a fresh login page, submit a baseline invalid email/password pair and record response timing, status, redirect, and visible message.
    - expect: A baseline unauthenticated response is available for comparison.
  2. Submit non-destructive error-oriented probes one at a time in Email, for example a single quote ('), a double quote ("), a closing parenthesis followed by a quote (') ), and a type-like probe such as 1' AND 1=CONVERT(int,(SELECT @@version)) -- only if the approved test policy permits it.
    - expect: The application rejects the input or treats it as ordinary text.
    - expect: No DBMS error, SQL fragment, table/column name, version, filesystem path, or stack trace is exposed.
    - expect: The server remains available and does not return a 5xx error.
  3. Submit a logically true probe and a logically false probe in separate fresh attempts, such as ' AND '1'='1' -- and ' AND '1'='2' --, in the Email field and then in the Password field.
    - expect: Neither probe authenticates the user.
    - expect: There is no meaningful response difference that reveals the result of a backend predicate beyond normal generic login failure behavior.
  4. Compare the baseline and probe responses for status code, body structure, redirects, cookies, and reasonable response-time consistency.
    - expect: No SQL-injection oracle is observable through content, status, redirect, cookie issuance, or abnormal timing.

#### 1.4. Reject encoded and canonicalization variants of SQL injection payloads

**File:** `tests/faculty-login-sql-injection/encoded-and-canonicalization.spec.ts`

**Steps:**
  1. Reset to the fresh login page. Submit URL-encoded equivalents of a classic bypass probe, such as %27%20OR%20%271%27%3D%271%27%20--, in Email with an arbitrary password.
    - expect: The server decodes input safely and rejects the attempt without authentication.
  2. Repeat using mixed-case SQL keywords, extra whitespace, tabs, plus signs, percent encoding, and alternate comment suffixes such as # and -- followed by a space.
    - expect: Input normalization does not create an authentication bypass.
    - expect: No SQL error or internal implementation detail is exposed.
  3. Repeat the variants in Password while using a test email, then inspect the response and session state.
    - expect: All variants remain unauthenticated and do not issue an authenticated session.

#### 1.5. Handle SQL-like input, length boundaries, and special characters safely

**File:** `tests/faculty-login-sql-injection/input-validation-and-boundaries.spec.ts`

**Steps:**
  1. From a fresh state, enter a single quote, double quote, backslash, semicolon, null-like text, and SQL comment markers as ordinary input in each field, one case at a time.
    - expect: The page remains usable and does not crash.
    - expect: Input is rejected or processed as data with a generic authentication failure.
    - expect: No query text, database error, or sensitive diagnostic is displayed.
  2. Submit very long SQL-like strings within a controlled test limit, for example 256, 1024, and 4096 characters, independently in Email and Password.
    - expect: The server enforces safe length/resource limits or returns a controlled validation failure.
    - expect: No 5xx error, timeout, resource exhaustion symptom, truncation-based bypass, or authentication occurs.
  3. Submit leading/trailing whitespace and Unicode/full-width lookalike variants around SQL metacharacters.
    - expect: Canonicalization and validation do not turn the input into executable SQL or bypass authentication.
    - expect: The response remains generic and safe.

#### 1.6. Ensure Remember Me cannot preserve or create an injection-derived session

**File:** `tests/faculty-login-sql-injection/remember-me-session.spec.ts`

**Steps:**
  1. Reset to a fresh browser context. Enter a SQL-bypass probe in Email, an arbitrary password, check Remember Me, and click Login.
    - expect: The request is rejected and no authenticated session is created.
  2. Inspect cookies and browser storage after the failed attempt, then close and reopen the browser context if the test harness supports it.
    - expect: No persistent authenticated cookie, token, or storage entry is issued as a result of the injection attempt.
    - expect: The reopened context is not authenticated.
  3. Repeat using a SQL-like probe in Password with Remember Me checked.
    - expect: Remember Me does not change the rejection outcome or create a privileged session.

#### 1.7. Keep SQL-injection failures generic and resistant to account enumeration

**File:** `tests/faculty-login-sql-injection/anti-enumeration-and-response-consistency.spec.ts`

**Steps:**
  1. Using fresh attempts, submit the same SQL-like probes with an approved existing test email and an approved non-existent email.
    - expect: Both cases produce equivalent generic failure behavior.
    - expect: The response does not reveal whether the email exists through message wording, status, redirect, cookies, or materially different response structure.
  2. Compare a normal invalid login with an injection-shaped invalid login for visible text and server response metadata.
    - expect: No response includes SQL syntax, database engine details, query fragments, usernames, email existence, or internal paths.
    - expect: Rate limiting or monitoring, if implemented, is triggered consistently without exposing sensitive details.

#### 1.8. Verify server-side controls remain enforced on direct login submissions

**File:** `tests/faculty-login-sql-injection/csrf-and-server-side-enforcement.spec.ts`

**Steps:**
  1. Load the login page fresh and note the hidden token field. Submit the form normally with invalid test credentials and record whether the token is included and whether the response is controlled.
    - expect: The normal request is handled by server-side validation and returns a safe generic failure.
  2. Using the approved test harness, submit the same SQL-injection probes directly to the login POST endpoint with the token missing, stale, duplicated, or altered; do not send destructive SQL statements.
    - expect: Server-side validation rejects invalid or missing request state safely.
    - expect: No request variant authenticates, leaks SQL errors, or bypasses validation merely because the client-side form was bypassed.
  3. Review server/application logs for the test window with authorized access.
    - expect: Injection attempts are recorded according to the application's security logging policy without logging plaintext passwords or excessive sensitive data.
    - expect: Any database exception is handled server-side and is not returned to the browser.

#### 1.9. Confirm normal login behavior is preserved after injection probes

**File:** `tests/faculty-login-sql-injection/post-test-regression.spec.ts`

**Steps:**
  1. Reset the environment and use an approved valid faculty test account with the correct password; do not use production credentials.
    - expect: The valid test account can reach the expected authenticated faculty destination.
  2. Log out or clear the test session, then submit a normal invalid credential pair.
    - expect: The invalid attempt is rejected with the standard generic message and no session is created.
  3. Return to the login page and verify the Email, Password, Remember Me, and Login controls remain available and functional.
    - expect: The login panel has no persistent error state caused by prior probes.
    - expect: Normal validation, session handling, and logout behavior remain intact.

// @ts-check
/**
 * Central configuration. Values can be overridden via environment variables
 * (see .env.example) so credentials need not live in source control.
 */
const E = process.env;
module.exports = {
  loginUrl:        E.XSS_LOGIN_URL        || 'http://10.0.62.74:8081/faculty/login.php',
  instructionsUrl: E.XSS_INSTRUCTIONS_URL || 'http://10.0.62.74:8081/faculty/Instructions.php',
  email:           E.XSS_EMAIL            || 'neha.1014103503@localhost.test',
  password:        E.XSS_PASSWORD         || 'Fresh@123',

  // Pages that DISPLAY submitted data (stored-XSS usually fires here, not on submit).
  reviewUrls: (E.XSS_REVIEW_URLS ? E.XSS_REVIEW_URLS.split(',').map(s => s.trim()).filter(Boolean) : [
    // 'http://10.0.62.74:8081/faculty/preview.php',
    // 'http://10.0.62.74:8081/faculty/myapplication.php',
  ]),

  // Pages probed for DOM-based XSS via hash / query params.
  domTargets: (E.XSS_DOM_TARGETS ? E.XSS_DOM_TARGETS.split(',').map(s => s.trim()).filter(Boolean) : [
    'http://10.0.62.74:8081/faculty/Instructions.php',
    'http://10.0.62.74:8081/faculty/index.php',
  ]),

  queryParams: ['q', 'search', 'name', 'id', 'msg', 'message', 'error', 'ref', 'redirect', 'return', 'url', 'page', 'lang', 'keyword'],

  selectors: {
    email:            'input[type="email"], input[name="email"], input[name="Email"], #email, #Email',
    password:         'input[type="password"], input[name="password"], input[name="Password"], #password',
    loginSubmit:      'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")',
    startApplication: 'a:has-text("Start Application"), button:has-text("Start Application"), a:has-text("Start application"), text=/start\\s*application/i',
    form:             'form',
    formSubmit:       'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Save")',
  },
};

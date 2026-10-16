// @ts-check
/**
 * Central configuration. Values can be overridden via environment variables
 * (see .env.example) so credentials need not live in source control.
 */
const E = process.env;
module.exports = {
  loginUrl:        E.XSS_LOGIN_URL        || 'http://10.0.62.109:8081/faculty/login.php',
  instructionsUrl: E.XSS_INSTRUCTIONS_URL || 'http://10.0.62.109:8081/faculty/Instructions.php',
  manageUrl:       E.XSS_MANAGE_URL       || 'http://10.0.62.109:8081/faculty/application_manage.php',
  email:           E.XSS_EMAIL            || 'neha.1014103503@localhost.test',
  password:        E.XSS_PASSWORD         || 'Fresh@123',

  // Always reuse the last editable application shown by Manage Application unless
  // an explicit application URL or ID is provided. Tests must not create applications.
  appUrl: E.XSS_APP_URL || (E.XSS_APP_ID ? `http://10.0.62.109:8081/faculty/facultyapply/${E.XSS_APP_ID}` : ''),
  applicationDate: E.XSS_APPLICATION_DATE || '2026-10-15',

  // Pages that DISPLAY submitted data (stored-XSS usually fires here, not on submit).
  reviewUrls: (E.XSS_REVIEW_URLS ? E.XSS_REVIEW_URLS.split(',').map(s => s.trim()).filter(Boolean) : [
    // 'http://10.0.62.109:8081/faculty/preview.php',
    // 'http://10.0.62.109:8081/faculty/myapplication.php',
  ]),

  // Pages probed for DOM-based XSS via hash / query params.
  domTargets: (E.XSS_DOM_TARGETS ? E.XSS_DOM_TARGETS.split(',').map(s => s.trim()).filter(Boolean) : [
    'http://10.0.62.109:8081/faculty/Instructions.php',
    'http://10.0.62.109:8081/faculty/index.php',
  ]),

  // Read-only SQL-injection probe targets. These must remain on the configured
  // faculty portal origin; the SQLi spec never posts to application-save routes.
  sqliTargets: [
    'http://10.0.62.109:8081/faculty/',
    'http://10.0.62.109:8081/faculty/index.php',
    'http://10.0.62.109:8081/faculty/Instructions.php',
  ],

  queryParams: ['q', 'search', 'name', 'id', 'msg', 'message', 'error', 'ref', 'redirect', 'return', 'url', 'page', 'lang', 'keyword'],

  // The 10 application sections. Each content form has its own AJAX draft-save
  // endpoint (ajax/<endpoint>). We POST FormData(form) directly to it (bypassing
  // client validation, which is not a security control) so payloads reach the
  // server, then re-render the form to detect stored reflection/execution.
  // `form` is matched by form id first, else by name attribute.
  // NEVER add ajaxSaveAll.php here — that is the FINAL submit (locks the application).
  sections: [
    { label: 'Biographical Details',          form: 'biographdata1',     endpoint: 'ajaxSaveTab1.php' },
    { label: 'Educational Background',         form: 'academicFrm',       endpoint: 'ajaxQualifications.php' },
    { label: 'Employment — PhD details',       form: 'tab2_data',         endpoint: 'ajaxSaveTab2.php' },
    { label: 'Employment — positions',         form: 'tab3_data',         endpoint: 'ajaxSaveemployment.php' },
    { label: 'Publications — Journal',         form: 'publication',       endpoint: 'ajaxSavePublication.php' },
    { label: 'Publications — Other',           form: 'other_publication', endpoint: 'ajaxSaveOtherPublication.php' },
    { label: 'Publications — Conference',      form: 'conference',        endpoint: 'ajaxSaveConference.php' },
    { label: 'Publications — DOI Conference',  form: 'doi_conference',    endpoint: 'ajaxSaveDOIConference.php' },
    { label: 'Patents',                        form: 'patent',            endpoint: 'ajaxSavePatent.php' },
    { label: 'Books',                          form: 'book',              endpoint: 'ajaxSaveBook.php' },
    { label: 'Research Grants',                form: 'research_grants',   endpoint: 'ajaxSaveResearchGrants.php' },
    { label: 'Teaching & Mentoring',           form: 'pgFrm',             endpoint: 'ajaxpostgraduate.php' },
    { label: 'Referee Information',            form: 'referees',          endpoint: 'ajaxSaveReferees.php' },
  ],

  // Force the full payload battery on EVERY field (default: a dangerous-char canary
  // gates each field, and the full battery runs only on fields that reflect it raw).
  fullBattery: E.XSS_FULL_BATTERY === '1',
  // Limit to one section by label substring (e.g. XSS_SECTION=Referee). Empty = all.
  sectionFilter: E.XSS_SECTION || '',

  selectors: {
    email:            'input[type="email"], input[name="email"], input[name="Email"], #email, #Email',
    password:         'input[type="password"], input[name="password"], input[name="Password"], #password',
    loginSubmit:      'button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")',
    startApplication: 'a:has-text("Start Application"), button:has-text("Start Application"), a:has-text("Start application"), text=/start\\s*application/i',
    editLink:         'a:has-text("Edit")',   // Manage Application -> open an existing application
    form:             'form',
    formSubmit:       'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Save")',
  },
};

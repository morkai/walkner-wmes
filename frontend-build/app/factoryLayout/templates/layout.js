define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n  <defs>\n    <linearGradient id="'),__append(idPrefix),__append('-prodLine-bg" x1="0" x2="0" y1="0" y2="1">\n      <stop offset="0%" stop-color="#ddd"/>\n      <stop offset="100%" stop-color="#999"/>\n    </linearGradient>\n    <linearGradient id="'),__append(idPrefix),__append('-prodLine-bg-idle" x1="0" x2="0" y1="0" y2="1">\n      <stop offset="0%" stop-color="#FFC864"/>\n      <stop offset="100%" stop-color="#F0AD4E"/>\n    </linearGradient>\n    <linearGradient id="'),__append(idPrefix),__append('-prodLine-bg-working" x1="0" x2="0" y1="0" y2="1">\n      <stop offset="0%" stop-color="#82DC82"/>\n      <stop offset="100%" stop-color="#5CB85C"/>\n    </linearGradient>\n    <linearGradient id="'),__append(idPrefix),__append('-prodLine-bg-downtime" x1="0" x2="0" y1="0" y2="1">\n      <stop offset="0%" stop-color="#FF7672"/>\n      <stop offset="100%" stop-color="#D9534F"/>\n    </linearGradient>\n    <linearGradient id="'),__append(idPrefix),__append('-metric-bg" x1="0" x2="0" y1="0" y2="1">\n      <stop offset="0" stop-color="#fff"/>\n      <stop offset="100%" stop-color="#ddd"/>\n    </linearGradient>\n  </defs>\n</svg>\n');return __output.join("")}});
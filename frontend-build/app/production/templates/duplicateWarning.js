define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production-duplicate">\n  <h1>'),__append(t("production","duplicate:title")),__append("</h1>\n  <p>"),__append(t("production","duplicate:message")),__append('</p>\n  <p><button onclick="window.location.reload()" type="button" class="btn btn-primary btn-lg">'),__append(t("production","duplicate:button")),__append("</button></p>\n</div>\n");return __output.join("")}});
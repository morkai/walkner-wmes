define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="well">\n  <p>'),__append(message),__append("</p>\n  "),notify&&(__append('\n  <hr style="margin: 0 0 10px 0">\n  <p id="'),__append(idPrefix),__append('-notify"><a href="#">'),__append(t("core","ERROR:notify:message")),__append("</a></p>\n  ")),__append("\n</div>\n");return __output.join("")}});
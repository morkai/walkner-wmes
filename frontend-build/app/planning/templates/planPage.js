define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="planning-plan '),__append(wrap?"wrap":""),__append(" "),__append(darker?"planning-darker":""),__append('">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <div id="'),__append(idPrefix),__append('-empty" class="message message-inline message-warning">\n    <p>'),__append(t("planning","empty")),__append('</p>\n  </div>\n  <div id="'),__append(idPrefix),__append('-mrps"></div>\n  <div id="'),__append(idPrefix),__append('-mrpSelector" class="planning-mrpSelector-container hidden">\n    <div class="planning-mrpSelector-mrps"></div>\n  </div>\n</div>\n');return __output.join("")}});
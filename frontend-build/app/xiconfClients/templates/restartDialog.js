define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<div>\n  "),__append(helpers.t("restartDialog:message",{client})),__append('\n  <div class="form-actions">\n    <button class="btn btn-danger dialog-answer" type="button" autofocus data-answer="yes">'),__append(helpers.t("restartDialog:yes")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(helpers.t("restartDialog:no")),__append("</button>\n  </div>\n</div>\n");return __output.join("")}});
define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="production-question">\n  '),__append(t("continueOrderDialog:message")),__append('\n  <div class="form-actions">\n    <button class="btn btn-lg btn-success dialog-answer" type="button" autofocus data-answer="yes">'),__append(t("continueOrderDialog:yes")),__append('</button>\n    <button class="btn btn-lg btn-link cancel" type="button">'),__append(t("continueOrderDialog:no")),__append("</button>\n  </div>\n</div>\n");return __output}});
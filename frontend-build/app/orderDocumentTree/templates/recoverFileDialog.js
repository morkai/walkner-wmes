define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<div>\n  "),__append(t("orderDocumentTree","recoverFile:message",{nc15})),__append('\n  <div class="form-actions">\n    <button class="btn btn-primary dialog-answer" type="button" data-answer="yes">'),__append(t("orderDocumentTree","recoverFile:yes")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("orderDocumentTree","removeFile:cancel")),__append("</button>\n  </div>\n</div>\n");return __output.join("")}});
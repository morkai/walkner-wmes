define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production-question">\n  '),__append(t("production","isa:cancel:message",{requestType:requestType})),__append('\n  <div class="form-actions">\n    <button class="btn btn-danger dialog-answer" type="button" autofocus data-answer="yes">'),__append(t("production","isa:cancel:yes")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("production","isa:cancel:no")),__append("</button>\n  </div>\n</div>\n");return __output.join("")}});
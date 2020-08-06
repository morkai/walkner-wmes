define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="form-group">\n    <label for="'),__append(id("code")),__append('" class="control-label">'),__append(t("massUpdate:code")),__append('</label>\n    <input id="'),__append(id("code")),__append('" name="code" class="form-control" type="text" pattern="^[A-Za-z0-9-]{4,10}$">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("old12")),__append('" class="control-label">'),__append(t("massUpdate:old12")),__append('</label>\n    <input id="'),__append(id("old12")),__append('" name="old12" class="form-control" type="text" pattern="^[0-9]{12}$">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("new12")),__append('" class="control-label is-required">'),__append(t("massUpdate:new12")),__append('</label>\n    <input id="'),__append(id("new12")),__append('" name="new12" class="form-control" type="text" required pattern="^[0-9]{12}$">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("newName")),__append('" class="control-label">'),__append(t("massUpdate:newName")),__append('</label>\n    <input id="'),__append(id("newName")),__append('" name="newName" class="form-control" type="text">\n  </div>\n  <div class="form-actions">\n    <button class="btn btn-primary" type="submit">'),__append(t("massUpdate:submit")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("massUpdate:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
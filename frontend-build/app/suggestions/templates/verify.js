define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="form-group">\n    <label  for="'),__append(id("comment")),__append('" class="control-label">'),__append(t("PROPERTY:comment")),__append('</label>\n    <textarea id="'),__append(id("comment")),__append('" name="comment" class="form-control" rows="4"></textarea>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(id("accept")),__append('" class="btn btn-success" type="button">\n      <i class="fa fa-thumbs-up"></i><span>'),__append(t("verify:accept")),__append('</span>\n    </button>\n    <button id="'),__append(id("reject")),__append('" class="btn btn-warning" type="button">\n      <i class="fa fa-thumbs-down"></i><span>'),__append(t("verify:reject")),__append('</span>\n    </button>\n    <button id="'),__append(id("reject")),__append('" class="btn btn-danger" type="button">\n      <i class="fa fa-times"></i><span>'),__append(t("verify:cancel")),__append('</span>\n    </button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
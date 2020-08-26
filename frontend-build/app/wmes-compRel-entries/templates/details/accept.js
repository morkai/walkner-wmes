define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append("<form>\n  "),__append(helpers.formGroup({name:"func",type:"select2",label:"accept:"})),__append("\n  "),__append(helpers.formGroup({name:"comment",type:"textarea",label:"accept:",rows:4})),__append('\n  <div class="form-actions">\n    <button id="'),__append(id("accept")),__append('" type="button" class="btn btn-success" style="min-width: 125px">\n      <i class="fa fa-thumbs-up"></i><span>'),__append(t("accept:accept")),__append('</span>\n    </button>\n    <button id="'),__append(id("reject")),__append('" type="button" class="btn btn-danger" style="min-width: 125px">\n      <i class="fa fa-thumbs-down"></i><span>'),__append(t("accept:reject")),__append('</span>\n    </button>\n    <button id="'),__append(id("reset")),__append('" type="button" class="btn btn-default" style="min-width: 125px">\n      <i class="fa fa-eraser"></i><span>'),__append(t("accept:reset")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
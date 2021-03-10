define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append("<form>\n  "),__append(helpers.formGroup({name:"orgUnit",label:"observerEditor:",type:"static",value:_.escape(model.orgUnit)})),__append("\n  "),__append(helpers.formGroup({name:"users",type:"select2",label:"observerEditor:"})),__append('\n  <div class="form-actions">\n    <button class="btn btn-primary" type="submit">'),__append(t("observerEditor:submit")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="osh-orgUnitPicker-dialog">\n  '),orgUnits.forEach(n=>{__append('\n  <div class="form-group">\n    <label class="radio-inline"><input type="radio" name="orgUnitType" value="'),__append(n.type),__append('"> '),__append(n.label),__append('</label>\n    <input id="'),__append(id(n.type)),__append('" class="osh-orgUnitPicker-orgUnits" name="'),__append(n.type),__append('" type="text" autocomplete="new-password">\n  </div>\n  ')}),__append('\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("wmes-osh-common","orgUnitPicker:dialog:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append('</button>\n    <button id="'),__append(id("deactivated")),__append('" type="button" class="btn btn-default osh-orgUnitPicker-deactivated '),__append(deactivated?"active":""),__append('">'),__append(t("wmes-osh-common","orgUnitPicker:dialog:deactivated")),__append("</button>\n  </div>\n</form>\n");return __output}});
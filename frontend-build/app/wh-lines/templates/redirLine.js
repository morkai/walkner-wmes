define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form data-mode="'),__append(mode),__append('">\n  <p class="message message-inline message-info" style="margin-bottom: 15px">\n    '),__append(t("redirLine:message:"+mode)),__append('\n  </p>\n  <div class="form-group">\n    <label class="control-label">'),__append(t("redirLine:sourceLine")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(sourceLine)),__append('</p>\n  </div>\n  <div class="form-group has-required-select2">\n    <label class="control-label" for="'),__append(idPrefix),__append('-targetLine">'),__append(t("redirLine:targetLine")),__append("</label>\n    "),"stop"===mode?(__append('\n    <p class="form-control-static">'),__append(escapeFn(targetLine)),__append("</p>\n    ")):(__append('\n    <input id="'),__append(idPrefix),__append('-targetLine" type="text" required>\n    ')),__append('\n  </div>\n  <div class="checkbox">\n    <label>\n      <input id="'),__append(idPrefix),__append('-redirDelivered" type="checkbox" value="true" checked>\n      '),__append(t("redirLine:redirDelivered")),__append('\n    </label>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("redirLine:submit:"+mode)),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
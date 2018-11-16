define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo" class="control-label">'),__append(t("planning","orders:add:orderNo")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" class="form-control no-controls" type="number" value="'),__append(orderNo),__append('" min="100000000" max="999999999">\n  </div>\n  <div id="'),__append(idPrefix),__append('-message" class="message message-inline message-warning hidden"></div>\n  <div id="'),__append(idPrefix),__append('-details" class="planning-orderAddDialog-details hidden"></div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary" disabled>\n      <span class="fa fa-spinner fa-spin hidden"></span>\n      <span>'),__append(t("planning","orders:add:submit")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
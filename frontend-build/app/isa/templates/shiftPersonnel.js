define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="action-form">\n  <p>'),__append(t("isa","shiftPersonnel:message")),__append('</p>\n  <input id="'),__append(idPrefix),__append('-users" type="text" autocomplete="new-password" value="'),__append(users),__append('">\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("isa","shiftPersonnel:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
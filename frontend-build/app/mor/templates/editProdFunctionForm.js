define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="action-form">\n  <div class="form-group">\n    <label class="control-label">'),__append(t("mor","editProdFunction:section")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(section)),__append('</p>\n  </div>\n  <div class="form-group">\n    <label class="control-label">'),__append(t("mor","editProdFunction:mrp")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(mrp)),__append('</p>\n  </div>\n  <div class="form-group">\n    <label class="control-label">'),__append(t("mor","editProdFunction:prodFunction")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(prodFunction)),__append('</p>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-users" class="control-label">'),__append(t("mor","editProdFunction:users")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-users" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("mor","editProdFunction:submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("mor","editProdFunction:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
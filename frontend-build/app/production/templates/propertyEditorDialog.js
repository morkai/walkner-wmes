define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="production-propertyEditorDialog">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-value">'),__append(t("production","propertyEditorDialog:label:"+property)),__append('</label>\n    <input id="'),__append(idPrefix),__append('-value" class="form-control small is-embedded" type="text" value="'),__append(value),__append('" max="'),__append(max),__append('" data-vkb="numeric">\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" class="btn btn-lg btn-primary" type="submit">'),__append(t("production","propertyEditorDialog:yes")),__append('</button>\n    <button class="btn btn-lg btn-link cancel" type="button">'),__append(t("production","propertyEditorDialog:no")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-file">'),__append(t("kanban","import:"+what+":file")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-file" name="file" class="form-control" type="file" accept=".xlsx" autofocus required>\n  </div>\n  <div class="form-group">\n    '),__append(t("kanban","import:"+what+":message")),__append('\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("kanban","import:"+what+":submit")),__append('</button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("kanban","import:"+what+":cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
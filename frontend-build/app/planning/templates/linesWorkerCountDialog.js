define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<form>\n  "),lines.forEach(function(n,p){__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append("-line-"),__append(p),__append('" class="control-label">'),__append(escapeFn(n._id)),__append('</label>\n    <input id="'),__append(idPrefix),__append("-line-"),__append(p),__append('" data-line-id="'),__append(escapeFn(n._id)),__append('" class="form-control" type="number" min="0" max="20" value="'),__append(n.workerCount),__append('">\n  </div>\n  ')}),__append('\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n      <span class="fa fa-spinner fa-spin hidden"></span>\n      <span>'),__append(t("planning","lines:menu:workerCount:submit")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});
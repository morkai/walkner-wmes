define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form planning-mrp-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-date" class="control-label">'),__append(t("planning","filter:date")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-date" name="date" class="form-control" type="date" value="'),__append(date),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('">\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button id="'),__append(idPrefix),__append('-useDarkerTheme" type="button" class="btn btn-default '),__append(useDarkerTheme?"active":""),__append('">\n        <i class="fa fa-adjust"></i>\n        <span>'),__append(t("planning","filter:useDarkerTheme")),__append("</span>\n      </button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});
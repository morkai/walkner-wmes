define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form>\n  <div class="form-row">\n    <div class="form-group" style="margin-bottom: 0">\n      <label for="'),__append(id("year")),__append('" class="control-label">'),__append(t("printDialog:year")),__append('</label>\n      <input id="'),__append(id("year")),__append('" name="year" type="number" class="form-control" value="'),__append(year),__append('" min="2021" max="'),__append(time.getMoment().format("YYYY")),__append('">\n    </div>\n    <div class="form-group">\n      <div style="display: flex; margin-bottom: 5px;">\n        <div class="radio">\n          <label class="control-label">\n            <input type="radio" name="periodType" value="month"> '),__append(t("printDialog:month")),__append('\n          </label>\n        </div>\n        <div class="radio" style="margin: 0 0 0 10px">\n          <label class="control-label">\n            <input type="radio" name="periodType" value="quarter"> '),__append(t("printDialog:quarter")),__append('\n          </label>\n        </div>\n      </div>\n      <input id="'),__append(id("period")),__append('" name="period" type="number" class="form-control" min="1" max="12" required>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">'),__append(t("printDialog:submit")),__append('</button>\n    <button type="button" class="btn btn-link cancel">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});
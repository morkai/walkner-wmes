define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form suggestions-report-filter">\n  '),__append(forms.dateTimeRange({idPrefix:idPrefix})),__append('\n  <div class="form-group">\n    <label>'),__append(t("reports","filter:interval")),__append('</label>\n    <div id="'),__append(id("interval")),__append('" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["year","quarter","month","week"].forEach(function(e){__append('\n      <label class="btn btn-default" title="'),__append(t("reports","filter:interval:title:"+e)),__append('" data-interval="'),__append(e),__append('">\n        <input type="radio" name="interval" value="'),__append(e),__append('"> '),__append(t("reports","filter:interval:"+e)),__append("\n      </label>\n      ")}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("status")),__append('">'),__append(t("PROPERTY:status")),__append('</label>\n    <select id="'),__append(id("status")),__append('" name="status[]" class="form-control is-expandable" multiple size="1">\n      '),statuses.forEach(function(e){__append('\n      <option value="'),__append(e),__append('">'),__append(t.has("filter:status:"+e)?t("filter:status:"+e):t("status:"+e)),__append("</option>\n      ")}),__append('\n    </select>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("sections")),__append('">'),__append(t("PROPERTY:section")),__append('</label>\n    <input id="'),__append(id("sections")),__append('" name="sections" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("reports","filter:submit")),__append("</span></button>\n  </div>\n</form>\n");return __output}});
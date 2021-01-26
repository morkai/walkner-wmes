define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(id("date")),__append('">'),__append(t("tester:date")),__append('</label>\n    <input id="'),__append(id("date")),__append('" name="date" class="form-control" type="date" required>\n  </div>\n  <div class="form-group has-required-select2">\n    <label for="'),__append(id("mrp")),__append('">'),__append(t("tester:mrp")),__append('</label>\n    <input id="'),__append(id("mrp")),__append('" name="mrp" type="text" required>\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-refresh"></i><span>'),__append(t("tester:refresh")),__append("</span></button>\n  </div>\n</form>\n");return __output}});
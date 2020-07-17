define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="well filter-form" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(id("code")),__append('" class="control-label">'),__append(t("PROPERTY:code")),__append('</label>\n    <input id="'),__append(id("code")),__append('" name="code" type="text" style="width: 125px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("family")),__append('" class="control-label">'),__append(t("PROPERTY:family")),__append('</label>\n    <input id="'),__append(id("family")),__append('" name="family" type="text" style="width: 125px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("nc12")),__append('" class="control-label">'),__append(t("PROPERTY:nc12")),__append('</label>\n    <input id="'),__append(id("nc12")),__append('" name="nc12" class="form-control" type="text" style="width: 115px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("name")),__append('" class="control-label">'),__append(t("PROPERTY:name")),__append('</label>\n    <input id="'),__append(id("name")),__append('" name="name" class="form-control" type="text">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("core","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output}});
define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="oshAudits-report">\n  <div id="'),__append(id("filter")),__append('" class="filter-container"></div>\n  '),metrics.forEach(function(n){__append("\n  <h3>"),__append(t("report:title:"+n)),__append('</h3>\n  <div id="'),__append(id(n)),__append('" class="oshAudits-report-'),__append(n),__append('"></div>\n  ')}),__append("\n</div>\n");return __output}});
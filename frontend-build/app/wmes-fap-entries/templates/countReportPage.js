define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="fap-report">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  '),metrics.forEach(function(e){__append("\n  <h3>"),__append(helpers.t("report:title:"+e)),__append('</h3>\n  <div id="'),__append(idPrefix),__append("-"),__append(e),__append('" class="fap-report-'),__append(e),__append('"></div>\n  ')}),__append("\n</div>\n");return __output.join("")}});
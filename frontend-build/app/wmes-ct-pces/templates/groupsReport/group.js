define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="ct-report-groups-product">\n  <h2>\n    '),canViewGroups?(__append('\n    <a href="#planning/orderGroups/'),__append(group._id),__append('">'),__append(escapeFn(group.name)),__append("</a>\n    ")):(__append("\n    "),__append(escapeFn(group.name)),__append("\n    ")),__append('\n  </h2>\n  <div id="'),__append(id("chart")),__append('"></div>\n  <div id="'),__append(id("table")),__append('"></div>\n</div>\n');return __output}});
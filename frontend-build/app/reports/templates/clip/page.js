define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="reports-drillingReportPage">\n  <div id="'),__append(idPrefix),__append('-header" class="reports-drillingHeader-container"></div>\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <div id="'),__append(idPrefix),__append('-displayOptions" class="reports-displayOptions-container hidden"></div>\n  <div id="'),__append(idPrefix),__append('-charts" class="reports-drillingCharts-container"></div>\n  <div id="'),__append(idPrefix),__append('-orders" class="reports-2-orders-container"></div>\n</div>\n');return __output.join("")}});
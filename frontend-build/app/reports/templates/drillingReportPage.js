define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="reports-drillingReportPage">\n  <div id="'),__append(idPrefix),__append('-header" class="reports-drillingHeader-container"></div>\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <div id="'),__append(idPrefix),__append('-displayOptions" class="reports-displayOptions-container hidden"></div>\n  <div id="'),__append(idPrefix),__append('-charts" class="reports-drillingCharts-container"></div>\n</div>\n');return __output.join("")}});
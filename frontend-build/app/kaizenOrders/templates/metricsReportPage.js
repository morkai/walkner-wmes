define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="kaizenOrders-report">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  '),["ipr","ips","ipc","count","users","fte"].forEach(function(n){__append("\n  <h3>"),__append(t("kaizenOrders","report:title:"+n)),__append('</h3>\n  <h4 id="'),__append(idPrefix),__append("-"),__append(n),__append('-total"></h4>\n  <div id="'),__append(idPrefix),__append("-"),__append(n),__append('-report"></div>\n  ')}),__append("\n</div>\n");return __output.join("")}});
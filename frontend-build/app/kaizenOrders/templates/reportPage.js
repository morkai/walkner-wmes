define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="kaizenOrders-report">\n  <div class="filter-container"></div>\n  '),metrics.forEach(function(r){__output.push("\n  <h3>"),__output.push(t("kaizenOrders","report:title:"+r)),__output.push('</h3>\n  <div class="kaizenOrders-report-'),__output.push(r),__output.push('"></div>\n  ')}),__output.push("\n  <h3>"),__output.push(t("kaizenOrders","report:title:confirmer")),__output.push('</h3>\n  <div class="kaizenOrders-report-confirmer"></div>\n  <h3>'),__output.push(t("kaizenOrders","report:title:owner")),__output.push('</h3>\n  <div class="kaizenOrders-report-owner"></div>\n</div>\n');return __output.join("")}});
define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(r){return void 0==r?"":String(r).replace(_MATCH_HTML,function(r){return _ENCODE_HTML_RULES[r]||r})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="reports-8">\n  <div class="filter-container"></div>\n  <div class="reports-8-tableAndChart">\n    <div class="reports-8-dirIndirTable-container"></div>\n    <div class="reports-8-dirIndirChart-container">.reports-8-dirIndirChart-container</div>\n  </div>\n  <div class="reports-8-tableAndChart">\n    <div class="reports-8-timesTable-container"></div>\n    <div class="reports-8-timesChart-container">.reports-8-timesChart-container</div>\n  </div>\n</div>\n');return __output.join("")}});
define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production-data">\n  <h2 class="production-sectionHeader">'),__append(t("production","section:data")),__append('</h2>\n  <div class="production-properties production-properties-orderInfo">\n    '),["orderNo","nc12","productName","operationName"].forEach(function(p){__append('\n    <div id="'),__append(idPrefix),__append("-"),__append(p),__append('" class="production-property production-property-'),__append(p),__append('">\n      <div class="production-property-name">'),__append(t("production","property:"+p)),__append('</div>\n      <div class="production-property-value"></div>\n    </div>\n    ')}),__append('\n  </div>\n  <div class="production-properties production-properties-orderData">\n    '),["createdAt","quantityDone","workerCount","workerCountSap","taktTime","lastTaktTime","avgTaktTime"].forEach(function(p){__append('\n    <div id="'),__append(idPrefix),__append("-"),__append(p),__append('" class="production-property production-property-'),__append(p),__append('">\n      <div class="production-property-name">'),__append(t("production","property:"+p)),__append('</div>\n      <div class="production-property-value"></div>\n    </div>\n    ')}),__append('\n  </div>\n  <div class="production-actions"></div>\n</div>\n');return __output.join("")}});
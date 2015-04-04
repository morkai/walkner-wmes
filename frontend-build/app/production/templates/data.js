define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(o){return void 0==o?"":String(o).replace(_MATCH_HTML,function(o){return _ENCODE_HTML_RULES[o]||o})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="production-data">\n  <h2 class="production-sectionHeader">'),__output.push(t("production","section:data")),__output.push('</h2>\n  <div class="production-properties production-properties-orderInfo">\n    <div class="production-property production-property-orderNo">\n      <div class="production-property-name">'),__output.push(t("production","property:orderNo")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-nc12">\n      <div class="production-property-name">'),__output.push(t("production","property:nc12")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-productName">\n      <div class="production-property-name">'),__output.push(t("production","property:productName")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-operationName">\n      <div class="production-property-name">'),__output.push(t("production","property:operationName")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n  </div>\n  <div class="production-properties production-properties-orderData">\n    <div class="production-property production-property-startedAt">\n      <div class="production-property-name">'),__output.push(t("production","property:createdAt")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-quantityDone">\n      <div class="production-property-name">'),__output.push(t("production","property:quantityDone")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-workerCount">\n      <div class="production-property-name">'),__output.push(t("production","property:workerCount")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-workerCountSap">\n      <div class="production-property-name">'),__output.push(t("production","property:workerCountSap")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n    <div class="production-property production-property-taktTime">\n      <div class="production-property-name">'),__output.push(t("production","property:taktTime")),__output.push('</div>\n      <div class="production-property-value"></div>\n    </div>\n  </div>\n  <div class="production-actions">\n    <button class="btn btn-danger production-action production-beginDowntime">Przestój</button>\n    <button class="btn btn-danger production-action production-beginBreak">Przerwa</button>\n    <button class="btn btn-success production-action production-endDowntime">Koniec przestoju</button>\n    <button class="btn btn-success production-action production-continueOrder">Kontynuuj zlecenie</button>\n    <button class="btn btn-success production-action production-pickNextOrder">Następne zlecenie</button>\n    <button class="btn btn-warning production-action production-endWork">Koniec pracy</button>\n  </div>\n</div>\n');return __output.join("")}});
define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="suggestions-report suggestions-report-summary">\n  <div class="filter-container no-print"></div>\n  <h3>'),__append(t("suggestions","report:title:summary:averageDuration")),__append('</h3>\n  <h4>\n    <span id="'),__append(idPrefix),__append('-averageDuration"></span>\n    <span id="'),__append(idPrefix),__append('-productFamily" class="suggestions-report-summary-productFamily"></span>\n  </h4>\n  <div class="suggestions-report-summary-averageDuration"></div>\n  <h3 class="no-print">'),__append(t("suggestions","report:title:summary:count")),__append('</h3>\n  <h4 id="'),__append(idPrefix),__append('-count" class="no-print"></h4>\n  <div class="suggestions-report-summary-count no-print"></div>\n  <h3>'),__append(t("suggestions","report:title:summary:suggestionOwners")),__append('</h3>\n  <div class="suggestions-report-summary-suggestionOwners"></div>\n  <h3>'),__append(t("suggestions","report:title:summary:categories")),__append('</h3>\n  <div class="suggestions-report-summary-categories"></div>\n</div>\n');return __output.join("")}});
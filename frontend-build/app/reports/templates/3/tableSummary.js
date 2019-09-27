define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="reports-3-tableSummary">\n  <table class="stripe order-column cell-border">\n    <thead>\n      <tr>\n        <th>'),__append(t("reports","oee:division")),__append('</th>\n        <th data-property="prodLine">'),__append(t("reports","oee:prodLine")),__append("</th>\n        <th>"),__append(t("reports","oee:inventoryNo")),__append("</th>\n        <th>"),__append(t("reports","oee:totalAvailability")),__append("</th>\n        <th>"),__append(t("reports","oee:operationalAvailability:h")),__append("</th>\n        <th>"),__append(t("reports","oee:operationalAvailability:%")),__append("</th>\n        <th>"),__append(t("reports","oee:exploitation:h")),__append("</th>\n        <th>"),__append(t("reports","oee:exploitation:%")),__append('</th>\n        <th data-property="oee">'),__append(t("reports","oee:oee")),__append("</th>\n        <th>"),__append(t("reports","oee:adjusting:duration")),__append("</th>\n        <th>"),__append(t("reports","oee:maintenance:duration")),__append("</th>\n        <th>"),__append(t("reports","oee:renovation:duration")),__append("</th>\n        <th>"),__append(t("reports","oee:malfunction:duration")),__append("</th>\n        <th>"),__append(t("reports","oee:malfunction:count")),__append("</th>\n        <th>"),__append(t("reports","oee:majorMalfunction:count")),__append("</th>\n        <th>"),__append(t("reports","oee:mttr")),__append("</th>\n        <th>"),__append(t("reports","oee:mtbf")),__append("</th>\n      </tr>\n    </thead>\n    <tbody></tbody>\n  </table>\n</div>\n");return __output.join("")}});
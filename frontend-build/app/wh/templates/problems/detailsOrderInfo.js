define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output="";function __append(p){void 0!==p&&null!==p&&(__output+=p)}with(locals||{})__append('<div class="wh-problems-column">\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:order")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(escapeFn(whOrder.order)),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:line")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(escapeFn(whOrder.line)),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:qty")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(escapeFn(whOrder.qty)),__append("/"),__append(escapeFn(whOrder.qtyTodo)),__append('</div>\n  </div>\n</div>\n<div class="wh-problems-column">\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:nc12")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(escapeFn(whOrder.nc12)),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:mrp")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(escapeFn(whOrder.mrp)),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:planStatus")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(whOrder.planStatusIcons),__append('</div>\n  </div>\n</div>\n<div class="wh-problems-column">\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:name")),__append('</div>\n    <div class="wh-problems-prop-value" style="max-width: none">'),__append(escapeFn(whOrder.name)),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:orderTime")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(whOrder.startDate),__append(" "),__append(whOrder.startTime),__append('</div>\n  </div>\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(t("prop:problemAt")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(whOrder.problemDate),__append(" "),__append(whOrder.problemTime),__append("</div>\n  </div>\n</div>\n");return __output}});
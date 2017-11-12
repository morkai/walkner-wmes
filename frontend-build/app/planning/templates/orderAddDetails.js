define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="checkbox">\n  <label class="control-label">\n    <input id="'),__append(idPrefix),__append('-urgent" type="checkbox" value="1" '),__append(urgent?"checked":""),__append(">\n    "),__append(t("planning","orders:add:urgent")),__append('\n  </label>\n</div>\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:date")),__append('</label>\n  <p class="form-control-static">'),__append(escapeFn(time.format(order.date,"LL"))),__append("</p>\n</div>\n"),plans.length&&(__append('\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:add:plans")),__append("</label>\n  <ul>\n    "),plans.forEach(function(n){__append("\n    <li>"),__append(time.format(n,"LL")),__append("</li>\n    ")}),__append("\n  </ul>\n</div>\n")),__append('\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:name")),__append('</label>\n  <p class="form-control-static">'),__append(escapeFn(order.name)),__append('</p>\n</div>\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:nc12")),__append('</label>\n  <p class="form-control-static">'),__append(escapeFn(order.nc12)),__append('</p>\n</div>\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:qty")),__append('</label>\n  <p class="form-control-static">'),__append(escapeFn(order.quantityDone)),__append("/"),__append(escapeFn(order.quantityTodo)),__append('</p>\n</div>\n<div class="form-group">\n  <label class="control-label">'),__append(t("planning","orders:statuses")),__append('</label>\n  <p class="form-control-static">'),__append(order.statuses),__append("</p>\n</div>\n");return __output.join("")}});
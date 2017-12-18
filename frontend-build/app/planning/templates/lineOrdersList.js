define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="planning-mrl-lineOrders-list '),__append(expanded?"is-expanded":""),__append('">\n  <table class="planning-mrp-lineOrders-table">\n    <thead>\n      <tr>\n        '),["no","shift","orderNo","nc12","name","qty:header","startTime","finishTime","lines"].forEach(function(n){__append('\n        <th class="is-min">'),__append(t("planning","lineOrders:list:"+n)),__append("</th>\n        ")}),__append('\n        <th class="no-scroll">'),__append(t("planning","lineOrders:list:comment")),__append("</th>\n      </tr>\n    </thead>\n    <tbody>\n      "),orders.forEach(function(n,e){__append('\n      <tr data-id="'),__append(n.orderNo),__append('" data-index="'),__append(e),__append('">\n        <td class="is-min text-right">'),__append(n.no),__append('.</td>\n        <td class="is-min">'),__append(t("core","SHIFT:"+n.shift)),__append('</td>\n        <td class="is-min">'),__append(n.orderNo),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.nc12)),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.name)),__append('</td>\n        <td class="is-min text-right">\n          '),n.qtyPlan===n.qtyTodo?(__append("\n          "),__append(n.qtyPlan.toLocaleString()),__append("\n          ")):(__append("\n          "),__append(t("planning","lineOrders:list:qty:value",{plan:n.qtyPlan,todo:n.qtyTodo})),__append("\n          ")),__append('\n        </td>\n        <td class="is-min text-right">'),__append(n.startTime),__append('</td>\n        <td class="is-min text-right">'),__append(n.finishTime),__append('</td>\n        <td class="is-min">'),__append(escapeFn(n.lines)),__append('</td>\n        <td class="no-scroll">'),__append(n.comment),__append("</td>\n      </tr>\n      ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});
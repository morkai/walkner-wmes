define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dailyMrpPlan-lineOrders-container">\n  '),shifts.length||(__append('\n  <div class="dailyMrpPlan-list-container dailyMrpPlan-lineOrders">\n    <div class="dailyMrpPlan-list-hd">'),__append(escape(line)),__append('</div>\n    <div class="dailyMrpPlan-lineOrders-shift"></div>\n    <div id="'),__append(idPrefix),__append('-list-0" class="dailyMrpPlan-list"></div>\n  </div>\n  ')),__append("\n  "),_.forEach(shifts,function(n,p){__append('\n  <div class="dailyMrpPlan-list-container dailyMrpPlan-lineOrders">\n    '),0==p&&(__append('\n    <div class="dailyMrpPlan-list-hd">'),__append(escape(line)),__append("</div>\n    ")),__append('\n    <div class="dailyMrpPlan-lineOrders-shift" data-shift="'),__append(n.no),__append('">'),__append(t("core","SHIFT:"+n.no)),__append('</div>\n    <div id="'),__append(idPrefix),__append("-list-"),__append(n.no),__append('" class="dailyMrpPlan-list dailyMrpPlan-lineOrders-list">\n      '),n.orders.forEach(function(n){__append('\n      <div class="dailyMrpPlan-list-item is-lineOrder '),__append(n.incomplete?"is-incomplete":""),__append(" "),__append(n.external?"is-external":""),__append('" data-id="'),__append(n._id),__append('" data-plan="'),__append(n.plan),__append('" style="width: '),__append(n.width),__append("%; margin-left: "),__append(n.margin),__append('%">\n        <div class="dailyMrpPlan-list-item-inner">\n          '),n.external?(__append("\n          "),__append(n.orderNo),__append(", "),__append(n.qty),__append(" "),__append(t("hourlyPlans","planning:unit")),__append(", "),__append(n.mrp),__append("\n          ")):(__append("\n          "),__append(n.orderNo),__append(", "),__append(n.qty),__append(" "),__append(t("hourlyPlans","planning:unit")),__append("\n          ")),__append("\n        </div>\n      </div>\n      ")}),__append("\n    </div>\n  </div>\n  ")}),__append("\n</div>\n");return __output.join("")}});
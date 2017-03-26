define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dailyMrpPlan-list-container dailyMrpPlan-orders">\n  <div class="dailyMrpPlan-list-hd">'),__append(t("hourlyPlans","planning:orders:hd")),__append('</div>\n  <button id="'),__append(idPrefix),__append('-edit" class="dailyMrpPlan-list-action btn btn-default" title="'),__append(t("hourlyPlans","planning:orders:edit")),__append('">\n    <i class="fa fa-edit"></i>\n  </button>\n  <div id="'),__append(idPrefix),__append('-list" class="dailyMrpPlan-list">\n    '),orders.forEach(function(n){__append('\n    <div class="dailyMrpPlan-list-item is-order is-selectable '),__append(n.completed?"is-completed":""),__append(" "),__append(n.surplus?"is-surplus":""),__append(" "),__append(n.invalid?"is-invalid":""),__append(" "),__append(n.ignored?"is-ignored":""),__append('" data-id="'),__append(escape(n._id)),__append('">\n      <div class="dailyMrpPlan-list-item-inner '),__append(n.confirmed?"is-cnf":""),__append(" "),__append(n.delivered?"is-dnf":""),__append('">\n        '),__append(escape(n._id)),__append('\n        <span class="dailyMrpPlan-list-property '),__append(n.customQty?"":"hidden"),__append('" data-property="qtyPlan"><i class="fa fa-sort-numeric-desc"></i></span>\n      </div>\n    </div>\n    ')}),__append('\n    <div class="dailyMrpPlan-list-ending"></div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-scrollIndicator" class="dailyMrpPlan-list-scrollIndicator hidden"></div>\n</div>\n');return __output.join("")}});
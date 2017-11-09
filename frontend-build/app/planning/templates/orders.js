define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="planning-mrp-list-container planning-mrp-orders">\n  <div class="planning-mrp-list-hd">'),__append(hdLabel),__append("</div>\n  "),showEditButton?(__append('\n  <button id="'),__append(idPrefix),__append('-add" class="planning-mrp-list-action btn btn-default" title="'),__append(t("planning","orders:add")),__append('">\n    <i class="fa fa-plus"></i>\n  </button>\n  ')):__append('\n  <span class="planning-mrp-list-action"></span>\n  '),__append('\n  <div id="'),__append(idPrefix),__append('-list" class="planning-mrp-list">\n    '),orders.forEach(function(n){__append('\n    <div class="planning-mrp-list-item is-order '),__append(icons?"with-icons":""),__append(" "),__append(n.started),__append(" "),__append(n.completed),__append(" "),__append(n.surplus),__append(" "),__append(n.invalid),__append(" "),__append(n.ignored),__append(" "),__append(n.incomplete),__append(" "),__append(n.unplanned),__append('" data-id="'),__append(escapeFn(n._id)),__append('">\n      <div class="planning-mrp-list-item-inner '),__append(n.confirmed),__append(" "),__append(n.delivered),__append('">\n        <span class="planning-mrp-list-item-label">'),__append(escapeFn(n._id)),__append("</span>\n        "),n.kind&&"unclassified"!==n.kind&&(__append('\n        <span class="planning-mrp-list-property" data-property="kind" title="'),__append(t("planning","orderPriority:"+n.kind)),__append('"><i class="fa fa-'),__append("small"===n.kind?"star-o":"easy"===n.kind?"star-half-full":"star"),__append('"></i></span>\n        ')),__append("\n        "),n.customQuantity&&(__append('\n        <span class="planning-mrp-list-property" data-property="customQuantity" title="'),__append(t("planning","orders:customQuantity")),__append('"><i class="fa fa-sort-numeric-desc"></i></span>\n        ')),__append("\n        "),n.late&&(__append('\n        <span class="planning-mrp-list-property" data-property="late" title="'),__append(t("planning","orders:late")),__append('"><i class="fa fa-hourglass-end"></i></span>\n        ')),__append("\n        "),n.added&&(__append('\n        <span class="planning-mrp-list-property" data-property="added" title="'),__append(t("planning","orders:added")),__append('"><i class="fa fa-plus"></i></span>\n        ')),__append("\n        "),n.urgent&&(__append('\n        <span class="planning-mrp-list-property" data-property="urgent" title="'),__append(t("planning","orders:urgent")),__append('"><i class="fa fa-exclamation"></i></span>\n        ')),__append("\n      </div>\n    </div>\n    ")}),__append('\n    <div class="planning-mrp-list-ending"></div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-scrollIndicator" class="planning-mrp-list-scrollIndicator hidden"></div>\n</div>\n');return __output.join("")}});
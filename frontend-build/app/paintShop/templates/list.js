define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="paintShop-list '),__append(showTimes?"paintShop-list-with-times":""),__append('">\n  '),orders.forEach(function(p){__append('\n  <div class="paintShop-list-item '),__append(isVisible(p)?"visible":"hidden"),__append('" data-order-id="'),__append(p._id),__append('" data-status="'),__append(p.status),__append('" data-mrp="'),__append(p.mrp),__append('">\n    <span class="paintShop-list-order">'),__append(p.order),__append("</span>\n    "),showTimes&&p.startedAtTime&&(__append('\n    <span class="paintShop-list-time"><i class="fa fa-hourglass-start"></i> '),__append(p.startedAtTime),__append("</span>\n    ")),__append("\n    "),showTimes&&(__append("\n    "),"partial"===p.status?(__append('\n    <span class="paintShop-list-time"><i class="fa fa-check"></i> '),__append(p.qtyDone.toLocaleString()),__append("/"),__append(p.qty.toLocaleString()),__append("</span>\n    ")):p.finishedAtTime&&(__append('\n    <span class="paintShop-list-time"><i class="fa fa-hourglass-end"></i> '),__append(p.finishedAtTime),__append("</span>\n    ")),__append("\n    ")),__append("\n  </div>\n  ")}),__append('\n  <div class="paintShop-list-item">&nbsp;</div>\n</div>\n');return __output.join("")}});
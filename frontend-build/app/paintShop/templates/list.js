define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="paintShop-list '),__append(showTimes?"paintShop-list-with-times":""),__append('">\n  '),orders.forEach(function(n){__append('\n  <div class="paintShop-list-item" data-order-id="'),__append(n._id),__append('" data-status="'),__append(n.status),__append('">\n    <span class="paintShop-list-order">'),__append(n.order),__append("</span>\n    "),showTimes&&n.startedAtText&&(__append('\n    <span class="paintShop-list-time"><i class="fa fa-hourglass-start"></i> '),__append(n.startedAtText),__append("</span>\n    ")),__append("\n    "),showTimes&&n.finishedAtText&&(__append('\n    <span class="paintShop-list-time"><i class="fa fa-hourglass-end"></i> '),__append(n.finishedAtText),__append("</span>\n    ")),__append("\n  </div>\n  ")}),__append('\n  <div class="paintShop-list-item">&nbsp;</div>\n</div>\n');return __output.join("")}});
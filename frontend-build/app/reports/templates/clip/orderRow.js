define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr class="'),__append(order.className),__append('" data-id="'),__append(order.no),__append('">\n  <td class="is-min">\n    '),canViewOrders?(__append('\n    <a href="#orders/'),__append(order.no),__append('">'),__append(order.no),__append("</a>\n    ")):(__append("\n    "),__append(order.no),__append("\n    ")),__append('\n  </td>\n  <td class="is-min reports-2-orders-name">'),__append(escapeFn(order.name)),__append('</td>\n  <td class="is-min">'),__append(order.mrp),__append('</td>\n  <td class="is-min is-number">'),__append(order.qty),__append('</td>\n  <td class="is-min reports-2-confirm reports-2-confirm-'),__append(order.cnfClassName),__append('">'),__append(order.cnfStatus),__append('</td>\n  <td class="is-min reports-2-confirm reports-2-confirm-'),__append(order.dlvClassName),__append('">'),__append(order.dlvStatus),__append('</td>\n  <td class="is-min">'),__append(order.date),__append('</td>\n  <td class="is-min">'),__append(order.cnfTime),__append('</td>\n  <td class="is-min">'),__append(order.dlvTime),__append('</td>\n  <td class="is-min">'),__append(order.planner),__append('</td>\n  <td class="is-min reports-2-orders-delayReason">'),__append(order.delayReason),__append('</td>\n  <td class="reports-2-orders-comment">'),__append(order.comment),__append("</td>\n</tr>\n");return __output.join("")}});
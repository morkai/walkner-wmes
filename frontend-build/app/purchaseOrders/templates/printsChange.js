define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-hover pos-changes-prints">\n  <thead>\n    <tr>\n      <th>'),__append(t("purchaseOrders","PROPERTY:print.shippingNo")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:print.paper")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:print.barcode")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:item._id")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:item.nc12")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:print.packageQty")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:print.componentQty")),__append("\n      <th>"),__append(t("purchaseOrders","PROPERTY:print.remainingQty")),__append('\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td rowspan="'),__append(change.items.length),__append('">'),__append(escapeFn(change.shippingNo||"-")),__append('</td>\n      <td rowspan="'),__append(change.items.length),__append('">'),__append(t("purchaseOrders","paper:"+change.paper)),__append('</td>\n      <td rowspan="'),__append(change.items.length),__append('">'),__append(t("purchaseOrders","barcode:"+change.barcode)),__append("</td>\n      <td>"),__append(change.items[0]._id),__append("</td>\n      <td>"),__append(change.items[0].nc12),__append('</td>\n      <td class="is-number">'),__append(change.items[0].packageQty.toLocaleString()),__append('</td>\n      <td class="is-number">'),__append(change.items[0].componentQty.toLocaleString()),__append('</td>\n      <td class="is-number">'),__append(change.items[0].remainingQty.toLocaleString()),__append("</td>\n    </tr>\n    "),change.items.forEach(function(n,e){__append("\n    "),0!==e&&(__append('\n    <tr class="pos-changes-prints-item">\n      <td>'),__append(n._id),__append("</td>\n      <td>"),__append(n.nc12),__append('</td>\n      <td class="is-number">'),__append(n.packageQty.toLocaleString()),__append('</td>\n      <td class="is-number">'),__append(n.componentQty.toLocaleString()),__append('</td>\n      <td class="is-number">'),__append(n.remainingQty.toLocaleString()),__append("</td>\n    </tr>\n    "))}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});
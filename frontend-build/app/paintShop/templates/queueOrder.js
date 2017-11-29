define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tbody class="paintShop-order '),__append(visible?"visible":"hidden"),__append(" "),__append(first?"is-first":""),__append(" "),__append(last?"is-last":""),__append('" data-order-id="'),__append(order._id),__append('" data-status="'),__append(order.status),__append('" data-mrp="'),__append(escapeFn(order.mrp)),__append('">\n  <tr class="paintShop-properties paintShop-order-order">\n    <td class="paintShop-property" data-property="no" rowspan="'),__append(order[rowSpan]),__append('">\n      '),__append(order.no),__append("\n      "),order.followups.forEach(function(p){__append('\n      <br>\n      <span class="paintShop-order-followup" data-followup-id="'),__append(p.id),__append('">\n        <i class="fa fa-level-'),__append(order.no<p.no?"down":"up"),__append('"></i>\n        <br>\n        '),__append(p.no),__append("\n        </span>\n      ")}),__append('\n    </td>\n    <td class="paintShop-property" data-property="order">'),__append(order.order),__append('</td>\n    <td class="paintShop-property" data-property="nc12">'),__append(order.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(order.qty.toLocaleString()),__append('</td>\n    <td class="paintShop-property" data-property="unit">PCE</td>\n    <td class="paintShop-property" data-property="name">'),__append(order.name),__append('</td>\n    <td class="paintShop-property" data-property="mrpTimePlacement" rowspan="'),__append(order[rowSpan]),__append('">\n      <span class="paintShop-property" data-property="mrp" title="'),__append(t("paintShop","PROPERTY:mrp")),__append('">\n        <i class="fa fa-filter"></i><span>'),__append(order.mrp),__append("</span>\n      </span>\n      "),order.startTime&&(__append('\n      <span class="paintShop-property" data-property="startTime" title="'),__append(t("paintShop","PROPERTY:startTime")),__append('">\n      <i class="fa fa-clock-o"></i><span>'),__append(order.startTimeTime),__append("</span>\n      </span>\n      ")),__append("\n      "),order.placement&&(__append('\n      <span class="paintShop-property" data-property="placement" title="'),__append(t("paintShop","PROPERTY:placement")),__append('">\n        <i class="fa fa-truck"></i><span>'),__append(order.placement),__append("</span>\n      </span>\n      ")),__append("\n      "),order.qtyPaint&&(__append('\n      <span class="paintShop-property" data-property="qtyPaint" title="'),__append(t("paintShop","PROPERTY:qtyPaint")),__append('">\n        <i class="fa fa-paint-brush"></i><span>'),__append(order.qtyPaint.toLocaleString()),__append("</span>\n      </span>\n      ")),__append("\n      "),order.qtyDone&&(__append('\n      <span class="paintShop-property" data-property="qtyDone" title="'),__append(t("paintShop","PROPERTY:qtyDone")),__append('">\n        <i class="fa fa-check"></i><span>'),__append(order.qtyDone.toLocaleString()),__append("</span>\n      </span>\n      ")),__append('\n    </td>\n    <td class="paintShop-property" rowspan="'),__append(order[rowSpan]),__append('">\n      '),order.startedAt&&(__append('\n      <span class="paintShop-property" data-property="startedAt" title="'),__append(t("paintShop","PROPERTY:startedAt")),__append('">\n        <i class="fa fa-hourglass-start"></i><span>'),__append(order.startedAtDate),__append("</span>\n      </span>\n      ")),__append("\n      "),order.finishedAt&&(__append('\n      <span class="paintShop-property" data-property="finishedAt" title="'),__append(t("paintShop","PROPERTY:finishedAt")),__append('">\n        <i class="fa fa-hourglass-end"></i><span>'),__append(order.finishedAtDate),__append("</span>\n      </span>\n      ")),__append("\n      "),commentVisible&&order.comment&&(__append('\n      <span class="paintShop-property" data-property="comment" title="'),__append(t("paintShop","PROPERTY:comment")),__append('">\n        <i class="fa fa-comment"></i><span>'),__append(escapeFn(order.comment)),__append("</span>\n      </span>\n      ")),__append("\n    </td>\n  </tr>\n  "),order.childOrders.forEach(function(p){__append('\n  <tr class="paintShop-properties paintShop-order-childOrder '),__append(p.last?"is-last":""),__append('">\n    <td class="paintShop-property" data-property="order" rowspan="'),__append(p[rowSpan]),__append('">'),__append(p.order),__append('</td>\n    <td class="paintShop-property" data-property="nc12">'),__append(p.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(p.qty?p.qty.toLocaleString():"?"),__append('</td>\n    <td class="paintShop-property">PCE</td>\n    <td class="paintShop-property" data-property="name">'),__append(escapeFn(p.name)),__append("</td>\n  </tr>\n  "),p.paintCount>1&&(__append('\n  <tr class="paintShop-properties paintShop-order-component">\n    <td class="paintShop-property" colspan="4">\n      <span class="paintShop-orderDetails-multiPaint">'),__append(t("paintShop","multiPaint",{count:p.paintCount})),__append("</span>\n    </td>\n  </tr>\n  ")),__append("\n  "),p.components.forEach(function(p){__append('\n  <tr class="paintShop-properties paintShop-order-component '),__append("G"===p.unit||"KG"===p.unit?"is-paint":""),__append('">\n    <td class="paintShop-property" data-property="nc12">'),__append(p.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(Math.ceil(p.qty).toLocaleString()),__append('</td>\n    <td class="paintShop-property" data-property="unit">'),__append(p.unit),__append('</td>\n    <td class="paintShop-property" data-property="name">'),__append(escapeFn(p.name)),__append("</td>\n  </tr>\n  ")}),__append("\n  ")}),__append("\n</tbody>\n");return __output.join("")}});
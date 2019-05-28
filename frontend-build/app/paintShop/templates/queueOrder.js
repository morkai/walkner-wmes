define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tbody class="paintShop-order '),__append(visible?"visible":"hidden"),__append(" "),__append(first?"is-first":""),__append(" "),__append(last?"is-last":""),__append('" data-order-id="'),__append(order._id),__append('" data-status="'),__append(order.status),__append('" data-mrp="'),__append(escapeFn(order.mrp)),__append('" data-cabin="'),__append(order.cabin),__append('">\n  <tr class="paintShop-properties paintShop-order-order">\n    <td class="paintShop-property" data-property="no" rowspan="'),__append(order[rowSpan]),__append('">\n      '),__append(order.no),__append("\n      "),order.followups.forEach(function(p){__append('\n      <br>\n      <span class="paintShop-order-followup" data-followup-id="'),__append(p.id),__append('">\n        <i class="fa fa-long-arrow-'),__append(order.no<p.no?"down":"up"),__append('"></i>\n        <br>\n        '),__append(p.no),__append("\n        </span>\n      ")}),__append('\n    </td>\n    <td class="paintShop-property" data-property="order">'),__append(order.order),__append('</td>\n    <td class="paintShop-property" data-property="nc12">'),__append(order.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(order.qty.toLocaleString()),__append('</td>\n    <td class="paintShop-property" data-property="unit">PCE</td>\n    <td class="paintShop-property" data-property="name">'),__append(order.name),__append('</td>\n    <td class="paintShop-property"></td>\n    <td class="paintShop-property" data-property="mrpTimePlacement" rowspan="'),__append(order[rowSpan]),__append('">\n      <span class="paintShop-property paintShop-property-mrp '),__append("cancelled"!==order.status&&mrpDropped?"is-dropped":""),__append('" data-property="mrp" data-mrp="'),__append(order.mrp),__append('" title="'),__append(t("paintShop","PROPERTY:mrp")),__append('">\n        <i class="fa fa-filter"></i><span>'),__append(order.mrp),__append('</span><i class="fa fa-level-down"></i>\n      </span>\n      '),order.startTime&&(__append('\n      <span class="paintShop-property" data-property="startTime" title="'),__append(t("paintShop","PROPERTY:startTime")),__append('">\n      <i class="fa fa-clock-o"></i><span>'),__append(order.startTimeTime),__append("</span>\n      </span>\n      ")),__append("\n      "),order.placement&&(__append('\n      <span class="paintShop-property" data-property="placement" title="'),__append(t("paintShop","PROPERTY:placement")),__append('">\n        <i class="fa fa-truck"></i><span>'),__append(order.placement),__append("</span>\n      </span>\n      ")),__append("\n      "),order.qtyPaint&&(__append('\n      <span class="paintShop-property" data-property="qtyPaint" title="'),__append(t("paintShop","PROPERTY:qtyPaint"+(order.drilling?":drilling":""))),__append('">\n        <i class="fa '),__append(order.drilling?"fa-circle-o":"fa-paint-brush"),__append('"></i><span>'),__append(order.qtyPaint.toLocaleString()),__append("</span>\n      </span>\n      ")),__append("\n      "),order.qtyDone&&(__append('\n      <span class="paintShop-property" data-property="qtyDone" title="'),__append(t("paintShop","PROPERTY:qtyDone"+(order.drilling?":drilling":""))),__append('">\n        <i class="fa fa-check"></i><span>'),__append(order.qtyDone.toLocaleString()),__append("</span>\n      </span>\n      ")),__append('\n      <span class="paintShop-property" data-property="qtyDlv" title="'),__append(t("paintShop","PROPERTY:qtyDlv")),__append('">\n        <i class="fa fa-shopping-cart"></i><span>'),__append((order.qty-order.qtyDlv).toLocaleString()),__append('</span>\n      </span>\n    </td>\n    <td class="paintShop-property" rowspan="'),__append(order[rowSpan]),__append('" data-property="timesCabin">\n      '),order.startedAt&&(__append('\n      <span class="paintShop-property" data-property="startedAt" title="'),__append(t("paintShop","PROPERTY:startedAt")),__append('">\n        <i class="fa fa-hourglass-start"></i><span>'),__append(order.startedAtDate),__append("</span>\n      </span>\n      ")),__append("\n      "),order.finishedAt&&(__append('\n      <span class="paintShop-property" data-property="finishedAt" title="'),__append(t("paintShop","PROPERTY:finishedAt")),__append('">\n        <i class="fa fa-hourglass-end"></i><span>'),__append(order.finishedAtDate),__append("</span>\n      </span>\n      ")),__append("\n      "),commentVisible&&order.comment&&(__append('\n      <span class="paintShop-property" data-property="comment" title="'),__append(t("paintShop","PROPERTY:comment")),__append('">\n        <i class="fa fa-comment"></i><span>'),__append(escapeFn(order.comment)),__append("</span>\n      </span>\n      ")),__append("\n      "),order.cabin&&(__append('\n      <span class="paintShop-property" data-property="cabin" title="'),__append(t("paintShop","PROPERTY:cabin")),__append('">\n        <span>'),__append(order.cabin),__append("</span>\n      </span>\n      ")),__append("\n    </td>\n  </tr>\n  "),order.childOrders.forEach(function(p,n){__append('\n  <tr class="paintShop-properties paintShop-order-childOrder '),__append(p.last?"is-last":""),__append(" "),__append(p.deleted?"is-deleted":""),__append('">\n    <td class="paintShop-property" data-property="order" rowspan="'),__append(p[rowSpan]),__append('">\n      '),__append(p.order),__append('\n      <span class="paintShop-childOrder-dropZone '),__append(getChildOrderDropZoneClass(p,order)),__append('" data-order-id="'),__append(order._id),__append('" data-child-order-index="'),__append(n),__append('"><i class="fa fa-level-down"></i></span>\n    </td>\n    <td class="paintShop-property" data-property="nc12">'),__append(p.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(p.qty?p.qty.toLocaleString():"?"),__append('</td>\n    <td class="paintShop-property">PCE</td>\n    <td class="paintShop-property" data-property="name">'),__append(escapeFn(p.name)),__append('</td>\n    <td class="paintShop-property"></td>\n  </tr>\n  '),p.paintCount>1?(__append('\n  <tr class="paintShop-properties paintShop-order-component">\n    <td class="paintShop-property" colspan="5">\n      <span class="paintShop-orderDetails-message paintShop-orderDetails-multiPaint">\n        '),__append(t("paintShop","multiPaint",{count:p.paintCount})),__append("\n      </span>\n    </td>\n  </tr>\n  ")):0===p.paintCount&&(__append('\n  <tr class="paintShop-properties paintShop-order-component">\n    <td class="paintShop-property" colspan="5">\n      <span class="paintShop-orderDetails-message paintShop-orderDetails-drilling">\n        '),__append(t("paintShop","drilling")),__append("\n      </span>\n    </td>\n  </tr>\n  ")),__append("\n  "),p.components.forEach(function(n){__append('\n  <tr class="paintShop-properties paintShop-order-component '),__append("G"===n.unit||"KG"===n.unit?"is-paint":""),__append(" "),__append(p.deleted?"is-deleted":""),__append('">\n    <td class="paintShop-property" data-property="nc12">'),__append(n.nc12),__append('</td>\n    <td class="paintShop-property" data-property="qty">'),__append(Math.ceil(n.qty).toLocaleString()),__append('</td>\n    <td class="paintShop-property" data-property="unit">'),__append(n.unit),__append('</td>\n    <td class="paintShop-property" data-property="name">'),__append(escapeFn(n.name)),__append('</td>\n    <td class="paintShop-property" data-property="placement">'),__append(escapeFn(n.placement)),__append("</td>\n  </tr>\n  ")}),__append("\n  ")}),__append("\n</tbody>\n");return __output.join("")}});
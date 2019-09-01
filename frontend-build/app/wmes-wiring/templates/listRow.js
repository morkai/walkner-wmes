define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr class="wiring-list-item '),__append(row.rowClassName),__append('" data-id="'),__append(row._id),__append('" data-nc12="'),__append(row.nc12),__append('" data-status="'),__append(row.status),__append('">\n  <td data-column-id="mrps" data-popover="'),__append(row.mrps.join(" ")),__append('" class="is-min">\n    '),__append(row.mrps[0]),__append("\n    "),row.mrps.length>1&&(__append("\n      +"),__append(row.mrps.length-1),__append("\n    ")),__append('\n  </td>\n  <td data-column-id="nc12" class="is-min text-center">'),__append(escapeFn(row.nc12)),__append('</td>\n  <td data-column-id="name" class="is-min">'),__append(escapeFn(row.name)),__append('</td>\n  <td data-column-id="qtyDone" class="is-min text-right">'),__append(row.qtyDone),__append('</td>\n  <td data-column-id="qtySeparator">/</td>\n  <td data-column-id="qty" class="is-min text-right">'),__append(row.qty),__append('</td>\n  <td data-column-id="leadingOrders" data-popover="'),__append(row.leadingOrders.join(" ")),__append('" class="is-min">\n    '),1===row.leadingOrders.length&&user.isAllowedTo("ORDERS:VIEW")?(__append('\n      <a href="#orders/'),__append(row.leadingOrders[0]),__append('" target="_blank">'),__append(row.leadingOrders[0]),__append("</a>\n    ")):(__append("\n      "),__append(row.leadingOrders[0]),__append("\n    ")),__append("\n    "),row.leadingOrders.length>1&&(__append("\n      +"),__append(row.leadingOrders.length-1),__append("\n    ")),__append('\n  </td>\n  <td data-column-id="status" class="is-min">'),__append(t("status:"+row.status)),__append("</td>\n  "),canUpdate&&(__append('\n  <td class="actions">\n    <div class="actions-group">\n      <button type="button"\n              class="btn btn-'),__append("new"===row.status?"info":"warning"),__append('"\n              title="'),__append(t("action:"+("new"===row.status?"start":"continue"))),__append('"\n              data-action="'),__append("new"===row.status?"start":"continue"),__append('"\n              '),__append(row.actionInProgress||"new"===row.status||"partial"===row.status?"":"disabled"),__append('>\n        <i class="fa fa-play"></i>\n      </button>\n      <button type="button" class="btn btn-success" title="'),__append(t("action:finish")),__append('" data-action="finish"\n              '),__append(row.actionInProgress||"started"===row.status?"":"disabled"),__append('>\n        <i class="fa fa-check"></i>\n      </button>\n      <button type="button" class="btn btn-default" title="'),__append(t("action:reset")),__append('" data-action="reset"\n              '),__append(row.actionInProgress||"new"===row.status?"disabled":""),__append('>\n        <i class="fa fa-repeat"></i>\n      </button>\n      <button type="button" class="btn btn-danger" title="'),__append(t("action:cancel")),__append('" data-action="cancel"\n              '),__append(row.actionInProgress||"cancelled"===row.status?"disabled":""),__append('>\n        <i class="fa fa-times"></i>\n      </button>\n    </div>\n  </td>\n  ')),__append("\n  <td></td>\n</tr>\n");return __output.join("")}});
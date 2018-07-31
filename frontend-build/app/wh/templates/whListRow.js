define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(t){return _ENCODE_HTML_RULES[t]||t}escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr class="'),__append(row.rowClassName),__append('" data-id="'),__append(row._id),__append('" data-order="'),__append(row.order),__append('">\n  <td data-column-id="no" class="is-min text-right" style="min-width: 35px">'),__append(row.no),__append('.</td>\n  <td data-column-id="group" class="is-min text-center" style="min-width: 29px">'),__append(row.group),__append('</td>\n  <td data-column-id="mrp" class="is-min">'),__append(row.mrp),__append('</td>\n  <td data-column-id="order" class="is-min planning-mrp-lineOrders-status" data-status="'),__append(row.planStatus),__append('">'),__append(row.order),__append('</td>\n  <td data-column-id="planStatus" class="is-min planning-mrp-lineOrders-status" data-status="'),__append(row.planStatus),__append('">'),__append(row.planStatusIcons),__append('</td>\n  <td data-column-id="nc12" class="is-min">'),__append(escapeFn(row.nc12)),__append('</td>\n  <td data-column-id="name" class="is-min">'),__append(escapeFn(row.name)),__append('</td>\n  <td data-column-id="qty" class="is-min text-right">'),__append(row.qty),__append("/"),__append(row.qtyTodo),__append('</td>\n  <td data-column-id="shift" class="is-min text-center" style="min-width: 35px">'),__append(t("core","SHIFT:"+row.shift)),__append('</td>\n  <td data-column-id="startTime" class="is-min text-right">'),__append(row.startTime),__append('</td>\n  <td data-column-id="finishTime" class="is-min text-right">'),__append(row.finishTime),__append('</td>\n  <td data-column-id="line" class="is-min">'),__append(escapeFn(row.line)),__append('</td>\n  <td data-column-id="whStatus" class="is-min wh-list-status" data-status="'),__append(row.status),__append('">'),__append(t("wh","status:"+row.status)),__append('</td>\n  <td data-column-id="set" class="is-min text-center '),__append(row.set?"is-clickable":""),__append('" style="min-width: 35px">'),__append(row.set),__append('</td>\n  <td data-column-id="picklist" class="is-min text-center wh-list-icon"><i class="fa '),__append(row.picklistFunc?row.picklistDone?"fa-thumbs-up":"fa-thumbs-down":"fa-question"),__append('"></i></td>\n  <td data-column-id="fmx" class="is-min text-center wh-list-icon" title="'),__append(t("wh","status:"+row.funcs[0].status)),__append('"><i class="fa '),__append(row.funcIcons.fmx),__append('"></i></td>\n  <td data-column-id="kitter" class="is-min text-center wh-list-icon" title="'),__append(t("wh","status:"+row.funcs[1].status)),__append('"><i class="fa '),__append(row.funcIcons.kitter),__append('"></i></td>\n  <td data-column-id="packer" class="is-min text-center wh-list-icon" title="'),__append(t("wh","status:"+row.funcs[2].status)),__append('"><i class="fa '),__append(row.funcIcons.packer),__append('"></i></td>\n  <td data-column-id="comment" class="planning-mrp-lineOrders-comment">'),__append(row.comment),__append("</td>\n</tr>\n");return __output.join("")}});
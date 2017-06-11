define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default pos-items">\n  <div class="panel-heading is-with-actions">'),__append(t("purchaseOrders","panel:items")),__append("</div>\n  "),toolbarVisible&&(__append('\n  <div class="btn-toolbar">\n    <div id="'),__append(idPrefix),__append('-statuses" class="btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="radio" name="status" value="waiting"> <i class="fa fa-unlock-alt"></i><span>'),__append(t("purchaseOrders","items:status:waiting",{count:waitingCount})),__append('</span>\n      </label>\n      <label class="btn btn-default" title="'),__append(t("purchaseOrders","items:status:inProgress:title")),__append('">\n        <input type="radio" name="status" value="inProgress">\n        <i class="fa fa-star-half-o"></i><span>'),__append(t("purchaseOrders","items:status:inProgress",{count:inProgressCount})),__append('</span>\n      </label>\n      <label class="btn btn-default">\n        <input type="radio" name="status" value="completed"> <i class="fa fa-lock"></i><span>'),__append(t("purchaseOrders","items:status:completed",{count:completedCount})),__append('</span>\n      </label>\n    </div>\n    <div class="btn-group">\n      <button id="'),__append(idPrefix),__append('-selectAll" class="btn btn-default"><i class="fa fa-check-square"></i><span>'),__append(t("purchaseOrders","items:select:all")),__append('</span></button>\n      <button id="'),__append(idPrefix),__append('-selectNone" class="btn btn-default"><i class="fa fa-square"></i><span>'),__append(t("purchaseOrders","items:select:none")),__append('</span></button>\n    </div>\n    <button id="'),__append(idPrefix),__append('-print" class="btn btn-primary"><i class="fa fa-print"></i><span>'),__append(t("purchaseOrders","items:print")),__append('</span></button><!--\n    //--><button id="'),__append(idPrefix),__append('-printVendor" class="btn btn-default"><i class="fa fa-print"></i><span>'),__append(t("purchaseOrders","items:printVendor")),__append("</span></button>\n  </div>\n  ")),__append('\n  <table class="table table-bordered table-hover">\n    <thead>\n      <tr>\n        <th>'),__append(t("purchaseOrders","PROPERTY:item._id")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.nc12")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.unit")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.qty")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.printedQty")),__append("</th>\n        "),open&&(__append("\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.schedule.qty")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.schedule.date")),__append("</th>\n        ")),__append("\n        <th>"),__append(t("purchaseOrders","PROPERTY:item.name")),__append("</th>\n        "),vendorNc12Visible&&(__append('\n        <th class="is-min">'),__append(t("vendorNc12s","PROPERTY:value")),__append("</th>\n        ")),__append("\n      </tr>\n    </thead>\n    <tbody>\n      "),items.forEach(function(n,e){__append('\n      <tr class="'),__append(n.rowClassName),__append('" data-item-id="'),__append(n._id),__append('">\n        <td colspan="999" class="pos-rowSeparator"></td>\n      </tr>\n      <tr class="pos-items-item '),__append(n.rowClassName),__append('" data-item-id="'),__append(n._id),__append('" data-schedule-length="'),__append(n.schedule.length),__append('">\n        <td rowspan="'),__append(n.rowSpan),__append('" class="pos-items-item-no">'),__append(+n._id),__append('</td>\n        <td rowspan="'),__append(n.rowSpan),__append('">'),__append(n.nc12),__append('</td>\n        <td rowspan="'),__append(n.rowSpan),__append('">'),__append(n.unit),__append('</td>\n        <td rowspan="'),__append(n.rowSpan),__append('" class="is-number">'),__append(n.qty.toLocaleString()),__append('</td>\n        <td rowspan="'),__append(n.rowSpan),__append('" class="pos-items-item-printedQty is-number '),__append(itemToPrints[n._id]?"is-clickable":""),__append('"><span class="pos-items-item-prints">'),__append(n.printedQty.toLocaleString()),__append("</span></td>\n        "),open&&(__append('\n        <td class="is-number">'),__append(n.schedule.length?n.schedule[0].qty.toLocaleString():""),__append("</td>\n        <td>"),__append(n.schedule.length?time.format(n.schedule[0].date,"L"):""),__append("</td>\n        ")),__append('\n        <td rowspan="'),__append(n.rowSpan),__append('" class="pos-items-item-name">'),__append(escapeFn(n.name)),__append("</td>\n        "),vendorNc12Visible&&(__append('\n        <td rowspan="'),__append(n.rowSpan),__append('" class="is-min">\n          '),n.vendorNc12&&(__append("\n          "),__append(escapeFn(n.vendorNc12.value)),__append(" "),__append(escapeFn(n.vendorNc12.unit)),__append("\n          ")),__append("\n        </td>\n        ")),__append("\n      </tr>\n      "),open&&(__append("\n      "),n.schedule.forEach(function(p,a){__append("\n      "),0!==a&&(__append('\n      <tr class="pos-items-item-schedule '),__append(n.rowClassName),__append('" data-item-id="'),__append(n._id),__append('" data-item-index="'),__append(e),__append('">\n        <td class="is-number">'),__append(p.qty.toLocaleString()),__append("</td>\n        <td>"),__append(time.format(p.date,"L")),__append("</td>\n      </tr>\n      "))}),__append("\n      ")),__append("\n      ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});
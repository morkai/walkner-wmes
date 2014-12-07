define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-default pos-items">\n  <div class="panel-heading is-with-actions">',t("purchaseOrders","panel:items"),"</div>\n  "),toolbarVisible&&buf.push('\n  <div class="btn-toolbar">\n    <div id="',idPrefix,'-statuses" class="btn-group" data-toggle="buttons">\n      <label class="btn btn-default">\n        <input type="radio" name="status" value="waiting"> <i class="fa fa-unlock-alt"></i><span>',t("purchaseOrders","items:status:waiting",{count:waitingCount}),'</span>\n      </label>\n      <label class="btn btn-default" title="',t("purchaseOrders","items:status:inProgress:title"),'">\n        <input type="radio" name="status" value="inProgress">\n        <i class="fa fa-star-half-o"></i><span>',t("purchaseOrders","items:status:inProgress",{count:inProgressCount}),'</span>\n      </label>\n      <label class="btn btn-default">\n        <input type="radio" name="status" value="completed"> <i class="fa fa-lock"></i><span>',t("purchaseOrders","items:status:completed",{count:completedCount}),'</span>\n      </label>\n    </div>\n    <div class="btn-group">\n      <button id="',idPrefix,'-selectAll" class="btn btn-default"><i class="fa fa-check-square"></i><span>',t("purchaseOrders","items:select:all"),'</span></button>\n      <button id="',idPrefix,'-selectNone" class="btn btn-default"><i class="fa fa-square"></i><span>',t("purchaseOrders","items:select:none"),'</span></button>\n    </div>\n    <button id="',idPrefix,'-print" class="btn btn-default"><i class="fa fa-print"></i><span>',t("purchaseOrders","items:print"),"</span></button>\n  </div>\n  "),buf.push('\n  <table class="table table-bordered table-hover">\n    <thead>\n      <tr>\n        <th>',t("purchaseOrders","PROPERTY:item._id"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:item.nc12"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:item.unit"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:item.qty"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:item.printedQty"),"</th>\n        "),open&&buf.push("\n        <th>",t("purchaseOrders","PROPERTY:item.schedule.qty"),"</th>\n        <th>",t("purchaseOrders","PROPERTY:item.schedule.date"),"</th>\n        "),buf.push("\n        <th>",t("purchaseOrders","PROPERTY:item.name"),"</th>\n      </tr>\n    </thead>\n    <tbody>\n      "),items.forEach(function(t,s){buf.push('\n      <tr class="',t.rowClassName,'" data-item-id="',t._id,'">\n        <td colspan="999" class="pos-rowSeparator"></td>\n      </tr>\n      <tr class="pos-items-item ',t.rowClassName,'" data-item-id="',t._id,'" data-schedule-length="',t.schedule.length,'">\n        <td rowspan="',t.rowSpan,'" class="pos-items-item-no">',+t._id,'</td>\n        <td rowspan="',t.rowSpan,'">',t.nc12,'</td>\n        <td rowspan="',t.rowSpan,'">',t.unit,'</td>\n        <td rowspan="',t.rowSpan,'" class="is-number">',t.qty.toLocaleString(),'</td>\n        <td rowspan="',t.rowSpan,'" class="pos-items-item-printedQty is-number ',itemToPrints[t._id]?"is-clickable":"",'"><span class="pos-items-item-prints">',t.printedQty.toLocaleString(),"</span></td>\n        "),open&&buf.push('\n        <td class="is-number">',t.schedule.length?t.schedule[0].qty.toLocaleString():"","</td>\n        <td>",t.schedule.length?time.format(t.schedule[0].date,"YYYY-MM-DD"):"","</td>\n        "),buf.push('\n        <td rowspan="',t.rowSpan,'" class="pos-items-item-name">',escape(t.name),"</td>\n      </tr>\n      "),open&&(buf.push("\n      "),t.schedule.forEach(function(e,n){buf.push("\n      "),0!==n&&buf.push('\n      <tr class="pos-items-item-schedule ',t.rowClassName,'" data-item-id="',t._id,'" data-item-index="',s,'">\n        <td class="is-number">',e.qty.toLocaleString(),"</td>\n        <td>",time.format(e.date,"YYYY-MM-DD"),"</td>\n      </tr>\n      ")}),buf.push("\n      ")),buf.push("\n      ")}),buf.push("\n    </tbody>\n  </table>\n</div>\n")}();return buf.join("")}});
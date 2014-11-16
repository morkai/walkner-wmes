define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<table class="table table-bordered table-condensed table-hover pos-prints">\n  <thead>\n    <tr>\n      <th>',t("purchaseOrders","PROPERTY:item.prints.printedAt"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.shippingNo"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.paper"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.barcode"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.packageQty"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.componentQty"),"\n      <th>",t("purchaseOrders","PROPERTY:item.prints.remainingQty"),'\n      <th class="actions">',t("core","LIST:COLUMN:actions"),"</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),prints.forEach(function(e){buf.push('\n    <tr class="pos-prints-print ',e.cancelled?"is-cancelled":"",'" data-print-id="',e._id,'">\n      <td>',time.format(e.printedAt,"LLL"),"</td>\n      <td>",e.shippingNo||"-","</td>\n      <td>",t("purchaseOrders","paper:"+e.paper),"</td>\n      <td>",t("purchaseOrders","barcode:"+e.barcode),'</td>\n      <td class="is-number">',e.packageQty.toLocaleString(),'</td>\n      <td class="is-number">',e.componentQty.toLocaleString(),'</td>\n      <td class="is-number">',e.remainingQty.toLocaleString(),'</td>\n      <td class="actions">\n        <button type="button" class="btn btn-default action-showPrintPdf" title="',t("purchaseOrders","prints:showPrintPdf"),'"><i class="fa fa-file-pdf-o"></i></button>\n        '),user.isAllowedTo("PURCHASE_ORDERS:MANAGE")&&buf.push('\n        <button type="button" class="btn btn-',e.cancelled?"success":"danger",' action-toggleCancelled" title="',t("purchaseOrders","prints:"+(e.cancelled?"restore":"cancel")),'"><i class="fa fa-thumbs-',e.cancelled?"up":"down",'"></i></button>\n        '),buf.push("\n      </td>\n    </tr>\n    ")}),buf.push("\n  </tbody>\n</table>\n")}();return buf.join("")}});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","moment","../i18n","../time","../core/Model","./PurchaseOrderItemCollection"],function(e,t,r,i,d,s){return d.extend({urlRoot:"/purchaseOrders",clientUrlRoot:"#purchaseOrders",topicPrefix:"purchaseOrders",privilegePrefix:"PURCHASE_ORDERS",nlsDomain:"purchaseOrders",labelAttribute:"_id",defaults:{},getFirstScheduledQuantity:function(e){return this.get("items").get(e).get("schedule")[0].qty},parse:function(e,t){return e=d.prototype.parse.call(this,e,t),t.update?(this.get("items").set(e.items),delete e.items):e.items=new s(e.items),e},update:function(e){var t=e.items;t&&(delete e.items,this.get("items").set(t)),this.set(e)},serialize:function(){var e=this.toJSON();return e.docDate=t.utc(e.docDate).format("LL"),e.vendor&&e.vendor._id?(e.vendorText=e.vendor._id,e.vendor.name.length&&(e.vendorText+=": "+e.vendor.name)):e.vendorText=e.vendor,e.items=e.items?e.items.invoke("serialize"):[],e.minScheduleDate=e.scheduledAt?t.utc(e.scheduledAt).format("YYYY-MM-DD"):null,e.className=e.open?"":"success",e.qty=e.qty.toLocaleString(),e.printedQty=e.printedQty.toLocaleString(),e.importedAt&&(e.importedAtText=i.format(e.importedAt,"LLLL")),e.createdAt&&(e.createdAtText=i.format(e.createdAt,"LLLL")),e.updatedAt&&(e.updatedAtText=i.format(e.updatedAt,"LLLL")),e}})});
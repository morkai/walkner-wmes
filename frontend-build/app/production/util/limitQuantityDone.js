// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(t){"use strict";function n(t){t.$id("quantityDone").trigger("input")}var e={"W-1":!0,"W-2":!0,"W-3":!0,"WB-1":!0,"WB-2":!0,"WB-3":!0,"WB-4":!0,AV1:!0,AV1_P:!0,AV2:!0,AV2_P:!0};return function(o,i,r){var a=r.id,u=r.get("orderId");a&&(o.ajax({url:"/prodSerialNumbers?limit(1)&prodShiftOrder="+a}).done(function(t){t&&t.totalCount&&(o.$id("quantityDone").attr("min",t.totalCount.toString()),i&&n(o))}),u&&!e[r.get("prodLine")]&&o.ajax({url:"/orders/"+u+"?select(qty,qtyMax,qtyDone)"}).done(function(e){var a=e.qty,u=e.qtyDone?e.qtyDone.total||0:0,d=e.qtyDone&&e.qtyDone.byLine?(t.findWhere(e.qtyDone.byLine,{_id:r.get("prodLine")})||{quantityDone:0}).quantityDone:0,y=r.get("quantityDone"),q=u-(d>=y?y:0),D=e.qtyMax||a,c=D-q;o.$id("quantityDone").attr("max",c),i&&n(o)}))}});
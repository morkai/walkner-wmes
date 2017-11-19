// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../i18n","../core/Model"],function(t,e,r,n){"use strict";function s(t){return["date","startedAt","finishedAt"].forEach(function(e){"string"==typeof t[e]&&(t[e]=new Date(t[e]))}),t}return n.extend({urlRoot:"/paintShop/orders",clientUrlRoot:"#paintShop/orders",topicPrefix:"paintShop.orders",privilegePrefix:"PAINT_SHOP",nlsDomain:"paintShop",parse:s,serialize:function(){var t=this.toJSON(),n=t.childOrders.length,s=n-1;return t.rowSpan=n+1,t.childOrders.forEach(function(e,r){t.rowSpan+=e.components.length,e.rowSpan=e.components.length+1,e.last=r===s}),t.startTime&&(t.startTimeText=e.utc.format(t.startTime,"HH:mm:ss")),t.startedAt&&(t.startedAtText=e.format(t.startedAt,"HH:mm:ss")),t.finishedAt&&(t.finishedAtText=e.format(t.finishedAt,"HH:mm:ss")),t.statusText=r("paintShop","status:"+t.status),t}},{parse:s})});
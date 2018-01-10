// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../i18n","../core/Model"],function(t,e,n,i){"use strict";function r(t){return["date","startedAt","finishedAt"].forEach(function(e){"string"==typeof t[e]&&(t[e]=new Date(t[e]))}),t}var a={777777777777:!0};return i.extend({urlRoot:"/paintShop/orders",clientUrlRoot:"#paintShop/orders",topicPrefix:"paintShop.orders",privilegePrefix:"PAINT_SHOP",nlsDomain:"paintShop",parse:r,serialize:function(i,r){var o=this;if(!i&&o.collection&&o.collection.serializedMap&&o.collection.serializedMap[this.id])return o.collection.serializedMap[this.id];!r&&o.collection&&o.collection.paints&&(r=o.collection.paints);var s=o.toJSON(),c=s.childOrders.length,l=c-1;if(s.rowSpan=c+1,s.rowSpanDetails=s.rowSpan,s.childOrders=s.childOrders.map(function(e,n){var i=[];s.paintCount=0,e.components.forEach(function(t){if(!a[t.nc12]){s.paintCount+="G"===t.unit||"KG"===t?1:0;var e=r?r.get(t.nc12):null;e?(t.name=e.get("name"),t.placement=e.get("shelf")+", "+e.get("bin")):t.placement="",i.push(t)}});var o=i.length,c=o+(s.paintCount>1?1:0);return s.rowSpan+=o,s.rowSpanDetails+=c,t.assign({rowSpan:o+1,rowSpanDetails:c+1,last:n===l},e,{components:i})}),s.startTime&&(s.startTimeTime=e.utc.format(s.startTime,"HH:mm:ss")),s.startedAt){var p=e.getMoment(s.startedAt);s.startedAtTime=p.format("HH:mm:ss"),s.startedAtDate=p.format("DD.MM, HH:mm:ss")}if(s.finishedAt){var m=e.getMoment(s.finishedAt);s.finishedAtTime=m.format("HH:mm:ss"),s.finishedAtDate=m.format("DD.MM, HH:mm:ss")}return s.statusText=n("paintShop","status:"+s.status),s}},{parse:r,isComponentBlacklisted:function(t){return a[t.nc12]}})});
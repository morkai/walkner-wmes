define(["underscore","../time","../i18n","../core/Model"],function(t,n,i,e){"use strict";var s={777777777777:!0};function a(t){return["date","startedAt","finishedAt"].forEach(function(n){"string"==typeof t[n]&&(t[n]=new Date(t[n]))}),t}return e.extend({urlRoot:"/paintShop/orders",clientUrlRoot:"#paintShop/orders",topicPrefix:"paintShop.orders",privilegePrefix:"PAINT_SHOP",nlsDomain:"paintShop",parse:a,serialize:function(e,a,r){if(r||(r=this.collection),!e&&r&&r.serializedMap&&r.serializedMap[this.id])return r.serializedMap[this.id];!a&&r&&r.paints&&(a=r.paints);var o=this.toJSON(),p=o.childOrders.length,l=p-1;if(o.rowSpan=p+1,o.rowSpanDetails=o.rowSpan,o.paints={},"000000000000"===o.paint.nc12&&(o.paints["000000000000"]=o.qty),o.childOrders=o.childOrders.map(function(n,i){var e=[];o.paintCount=0,n.paints={},n.paintList=[],n.components.forEach(function(t){if(!s[t.nc12]){"G"!==t.unit&&"KG"!==t.unit||(o.paintCount+=1,o.paints[t.nc12]||(o.paints[t.nc12]=0),n.paints[t.nc12]||(n.paints[t.nc12]=0,n.paintList.push(t.nc12)),o.paints[t.nc12]+=n.qty,n.paints[t.nc12]+=n.qty);var i=a?a.get(t.nc12):null;i?(t.name=i.get("name"),t.placement=i.get("shelf")+", "+i.get("bin")):t.placement="",e.push(t)}});var p=e.length,c=p+(1!==o.paintCount?1:0);if(o.rowSpan+=p,o.rowSpanDetails+=c,r&&o.followups.length){var f=o.followups;o.followups=[],f.forEach(function(t){var n=r.get(t);n&&o.followups.push({id:t,no:n.get("no")})})}return t.assign({rowSpan:p+1,rowSpanDetails:c+1,last:i===l},n,{components:e})}),o.startTime&&(o.startTimeTime=n.utc.format(o.startTime,"HH:mm:ss")),o.startedAt){var c=n.getMoment(o.startedAt);o.startedAtTime=c.format("HH:mm:ss"),o.startedAtDate=c.format("DD.MM, HH:mm:ss")}if(o.finishedAt){var f=n.getMoment(o.finishedAt);o.finishedAtTime=f.format("HH:mm:ss"),o.finishedAtDate=f.format("DD.MM, HH:mm:ss")}return"finished"===o.status&&o.qtyDlv>=o.qty&&(o.status="delivered"),o.statusText=i("paintShop","status:"+o.status),o}},{parse:a,isComponentBlacklisted:function(t){return s[t.nc12]}})});
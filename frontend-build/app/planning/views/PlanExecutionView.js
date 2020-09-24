define(["app/time","app/core/View","app/planning/templates/planExecution"],function(t,e,r){"use strict";return e.extend({template:r,getTemplateData:function(){var e=this,r=e.mrp?e.mrp.id:null,n={true:"is-ok",false:"is-nok"};return{mrps:e.plan.mrps.map(function(i){return r&&i.id!==r?null:{_id:i.id,lines:i.lines.map(function(r){var i=1;return{_id:r.id,orders:r.orders.map(function(a){var o=a.get("orderNo"),s=e.plan.orders.get(o);if(!s)return null;var u=s.getOperationNo(),l=a.get("quantity"),d=t.utc.getMoment(a.get("startAt")),f=d.format("YYYY-MM-DD"),m=[],p=!1;e.plan.shiftOrders.findOrders(o).forEach(function(e){var i=e.get("operationNo");if(u===i){var a=e.get("prodLine"),o=e.get("quantityDone"),s=t.getMoment(e.get("startedAt")).utc(!0),c=s.format("YYYY-MM-DD"),g={line:n[a===r.id],quantity:n[o===l],date:n[c===f],time:n[Math.abs(s.diff(d,"minutes"))<=240]};m.push({line:a,quantityDone:o,startedAtTime:s.format("HH:mm:ss"),startedAtDate:c,startedAt:s.valueOf(),classNames:g,ok:"is-ok"===g.line&&"is-ok"===g.quantity&&"is-ok"===g.time}),p||(p=m[m.length-1].ok)}});var c={numeric:!0,ignorePunctuation:!0};return m.sort(function(t,e){if(t.line===r.id&&e.line!==r.id)return-1;if(t.line!==r.id&&e.line===r.id)return 1;var n=t.line.localeCompare(e.line,void 0,c);return 0===n&&(n=t.startedAt-e.startedAt),n}),{no:i++,orderNo:o,quantityPlanned:l,startAtTime:d.format("HH:mm:ss"),startAtDate:f,shiftOrders:m,ok:p}}).filter(t=>!!t)}}).filter(t=>!!t&&t.orders.length)}}).filter(t=>!!t)}},afterRender:function(){}})});
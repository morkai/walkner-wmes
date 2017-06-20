// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model"],function(e,n,t,o){"use strict";return o.extend({urlRoot:"/kaizen/reports/summary",nlsDomain:"kaizenOrders",defaults:function(){return{from:0,to:0,section:[],confirmer:[],interval:"week"}},fetch:function(n){return e.isObject(n)||(n={}),n.data=e.extend(n.data||{},e.pick(this.attributes,["from","to","section","confirmer"])),n.data.section=n.data.section.join(","),n.data.confirmer=n.data.confirmer.join(","),o.prototype.fetch.call(this,n)},genClientUrl:function(){return"/kaizenSummaryReport?from="+this.get("from")+"&to="+this.get("to")+"&section="+this.get("section")+"&confirmer="+this.get("confirmer")},parse:function(n){var t={total:{averageDuration:n.averageDuration,count:n.count},averageDuration:[],count:{open:[],finished:[],cancelled:[]},nearMissOwners:{categories:[],open:[],finished:[],cancelled:[]}},o=t.averageDuration,r=t.count,i=t.nearMissOwners;return e.forEach(n.nearMissOwners,function(e){i.categories.push(n.users[e[0]]),i.open.push(e[2]),i.finished.push(e[3]),i.cancelled.push(e[4])}),e.forEach(n.groups,function(e){"number"==typeof e?(o.push({x:e,y:0}),r.open.push({x:e,y:0}),r.finished.push({x:e,y:0}),r.cancelled.push({x:e,y:0})):(o.push({x:e.key,y:e.averageDuration,color:e.averageDuration>5?"#d9534f":"#5cb85c"}),r.open.push({x:e.key,y:e.count.open}),r.finished.push({x:e.key,y:e.count.finished}),r.cancelled.push({x:e.key,y:e.count.cancelled}))}),t}},{fromQuery:function(n){return void 0===n.from&&void 0===n.to&&(n.from=t.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+n.from||void 0,to:+n.to||void 0,section:e.isEmpty(n.section)?[]:n.section.split(","),confirmer:e.isEmpty(n.confirmer)?[]:n.confirmer.split(",")})}})});
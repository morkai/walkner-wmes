// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model"],function(e,n,t,o){"use strict";return o.extend({urlRoot:"/suggestions/reports/summary",nlsDomain:"suggestions",defaults:function(){return{from:0,to:0,section:[],confirmer:[],interval:"week"}},fetch:function(n){return e.isObject(n)||(n={}),n.data=e.extend(n.data||{},e.pick(this.attributes,["from","to","section","confirmer"])),n.data.section=n.data.section.join(","),n.data.confirmer=n.data.confirmer.join(","),o.prototype.fetch.call(this,n)},genClientUrl:function(){return"/suggestionSummaryReport?from="+this.get("from")+"&to="+this.get("to")+"&section="+this.get("section")+"&confirmer="+this.get("confirmer")},parse:function(n){var t={total:{averageDuration:n.averageDuration,count:n.count},averageDuration:[],count:{open:[],finished:[],cancelled:[]},suggestionOwners:{categories:[],open:[],finished:[],cancelled:[]},categories:{categories:[],open:[],finished:[],cancelled:[]}},o=t.averageDuration,i=t.count,r=t.suggestionOwners,s=t.categories;return e.forEach(n.suggestionOwners,function(e){r.categories.push(n.users[e[0]]||e[0]),r.open.push(e[2]),r.finished.push(e[3]),r.cancelled.push(e[4])}),e.forEach(n.categories,function(e){s.categories.push(n.categoryNames[e[0]]||e[0]),s.open.push(e[2]),s.finished.push(e[3]),s.cancelled.push(e[4])}),e.forEach(n.groups,function(e){"number"==typeof e?(o.push({x:e,y:0}),i.open.push({x:e,y:0}),i.finished.push({x:e,y:0}),i.cancelled.push({x:e,y:0})):(o.push({x:e.key,y:e.averageDuration,color:e.averageDuration>5?"#d9534f":"#5cb85c"}),i.open.push({x:e.key,y:e.count.open}),i.finished.push({x:e.key,y:e.count.finished}),i.cancelled.push({x:e.key,y:e.count.cancelled}))}),t}},{fromQuery:function(n){return new this({from:+n.from||void 0,to:+n.to||void 0,section:e.isEmpty(n.section)?[]:n.section.split(","),confirmer:e.isEmpty(n.confirmer)?[]:n.confirmer.split(",")})}})});
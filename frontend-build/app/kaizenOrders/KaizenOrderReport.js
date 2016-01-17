// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model","../data/colorFactory","./dictionaries"],function(e,r,t,s,i,o){"use strict";var n="#d9534f",a="#f0ad4e",u="#5cb85c",p=["type","status","section","area","cause","risk","nearMissCategory"],c={section:"sections",area:"areas",cause:"causes",risk:"risks",nearMissCategory:"categories",suggestionCategory:"categories"};return window.KAIZEN_MULTI&&p.push("suggestionCategory"),s.extend({urlRoot:"/kaizen/report",defaults:function(){return{from:0,to:0,interval:"month",sections:[]}},fetch:function(r){return e.isObject(r)||(r={}),r.data=e.extend(r.data||{},e.pick(this.attributes,["from","to","interval","sections"])),r.data.sections=r.data.sections.join(","),s.prototype.fetch.call(this,r)},genClientUrl:function(){return"/kaizenReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&sections="+this.get("sections")},parse:function(r){var t=this,s=r.totals,i=s.count,n={type:{rows:this.prepareTypeRows(s),series:this.prepareTypeSeries()},status:{rows:this.prepareRows(i,s.status,"status"),series:{}},owner:{categories:this.prepareUserCategories(r.users,s.owner),series:this.prepareOwnerSeries(s.owner,r.groups)},confirmer:{categories:this.prepareUserCategories(r.users,s.confirmer),series:this.prepareConfirmerSeries(s.confirmer,r.groups)}};return e.forEach(p,function(e){n[e]||(n[e]={rows:t.prepareRows(i,s[e],e),series:{}})}),e.forEach(r.groups,function(r){var s;"number"==typeof r?(s=r,r={key:s,type:{}}):s=r.key;var i=n.type.series;i.nearMiss.data.push({x:s,y:r.type.nearMiss||null}),o.multiType&&(i.suggestion.data.push({x:s,y:r.type.suggestion||null}),i.kaizen.data.push({x:s,y:r.type.kaizen||null})),e.forEach(p,function(e){"type"!==e&&t.createSeriesFromRows(e,n,r)})},this),n},prepareTypeRows:function(e){if(!o.multiType)return[{id:"nearMiss",abs:e.type.nearMiss,rel:e.type.nearMiss/e.count,color:n}];var r=e.type.nearMiss+e.type.suggestion+e.type.kaizen;return[{id:"singleTotal",abs:e.count,rel:1},{id:"multiTotal",abs:r,rel:1},{id:"nearMiss",abs:e.type.nearMiss,rel:e.type.nearMiss/r,color:n},{id:"suggestion",abs:e.type.suggestion,rel:e.type.suggestion/r,color:a},{id:"kaizen",abs:e.type.kaizen,rel:e.type.kaizen/r,color:u}]},prepareTypeSeries:function(){var e={nearMiss:{data:[],color:n}};return o.multiType&&(e.suggestion={data:[],color:a},e.kaizen={data:[],color:u}),e},prepareRows:function(e,r,t){var s=c[t];return r.map(function(r){return{id:r[0],abs:r[1],rel:r[1]/e,color:i.getColor(t,r[0]),label:s?o.getLabel(s,r[0]):void 0}})},createSeriesFromRows:function(r,t,s){var i=t[r].series;e.forEach(t[r].rows,function(e){i[e.id]||(i[e.id]={name:e.label,data:[],color:e.color}),i[e.id].data.push({x:s.key,y:s[r]?s[r][e.id]||null:null})})},prepareUserCategories:function(e,r){return r.map(function(r){var t=r[0];return e[t]||t})},prepareOwnerSeries:function(t){var s=[{id:"nearMiss",name:r.bound("kaizenOrders","report:series:nearMiss"),data:[],color:n}];return o.multiType&&(s.push({id:"suggestion",name:r.bound("kaizenOrders","report:series:suggestion"),data:[],color:a}),s.push({id:"kaizen",name:r.bound("kaizenOrders","report:series:kaizen"),data:[],color:u})),e.forEach(t,function(e){s[0].data.push(e[2]),o.multiType&&(s[1].data.push(e[3]),s[2].data.push(e[4]))}),s},prepareConfirmerSeries:function(t){return[{id:"entry",type:"bar",name:r.bound("kaizenOrders","report:series:"+(o.multiType?"entry":"nearMiss")),color:o.multiType?null:n,data:e.map(t,function(e){return e[1]})}]}},{TABLE_AND_CHART_METRICS:p,fromQuery:function(r){return new this({from:+r.from||void 0,to:+r.to||void 0,interval:r.interval||void 0,sections:e.isEmpty(r.sections)?[]:r.sections.split(",")})}})});
// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model","../data/colorFactory","app/kaizenOrders/dictionaries"],function(e,t,r,o,s,i){"use strict";var n="#f0ad4e",a="#5cb85c",u=["total","status","section","category","productFamily"];return o.extend({urlRoot:"/suggestions/reports/count",nlsDomain:"suggestions",defaults:function(){return{from:0,to:0,interval:"month",sections:[],categories:[]}},fetch:function(t){return e.isObject(t)||(t={}),t.data=e.extend(t.data||{},e.pick(this.attributes,["from","to","interval","sections","categories"])),t.data.sections=t.data.sections.join(","),t.data.categories=t.data.categories.join(","),o.prototype.fetch.call(this,t)},genClientUrl:function(){return"/suggestionCountReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&sections="+this.get("sections")+"&categories="+this.get("categories")},parse:function(t){var r=this,o=t.totals,s=o.count,i={total:{rows:this.prepareTotalRows(o),series:this.prepareTotalSeries()},status:{rows:this.prepareRows(s,o.status,"status"),series:{}},owner:{categories:this.prepareUserCategories(t.users,o.owner),series:this.prepareOwnerSeries(o.owner,t.groups)},confirmer:{categories:this.prepareUserCategories(t.users,o.confirmer),series:this.prepareConfirmerSeries(o.confirmer,t.groups)}};return e.forEach(u,function(e){i[e]||(i[e]={rows:r.prepareRows(s,o[e],e),series:{}})}),e.forEach(t.groups,function(t){var o;"number"==typeof t?(o=t,t={key:o,type:{}}):o=t.key;var s=i.total.series;s.suggestion.data.push({x:o,y:t.type.suggestion||null}),s.kaizen.data.push({x:o,y:t.type.kaizen||null}),e.forEach(u,function(e){r.createSeriesFromRows(e,i,t)})},this),i},prepareTotalRows:function(e){return[{id:"suggestion",abs:e.type.suggestion,rel:1,color:n},{id:"kaizen",abs:e.type.kaizen,rel:e.type.kaizen/e.type.suggestion,color:a}]},prepareTotalSeries:function(){return{suggestion:{data:[],color:n},kaizen:{data:[],color:a}}},prepareRows:function(e,t,r){var o=i.forProperty(r);return t.map(function(t){return{id:t[0],abs:t[1],rel:t[1]/e,color:s.getColor(r,t[0]),label:o?i.getLabel(o,t[0]):void 0}})},createSeriesFromRows:function(t,r,o){var s=r[t].series;e.forEach(r[t].rows,function(e){s[e.id]||(s[e.id]={name:e.label,data:[],color:e.color}),s[e.id].data.push({x:o.key,y:o[t]?o[t][e.id]||null:null})})},prepareUserCategories:function(e,t){return t.map(function(t){var r=t[0];return e[r]||r})},prepareOwnerSeries:function(r){var o=[{id:"suggestion",name:t.bound("suggestions","report:series:suggestion"),data:[],color:n},{id:"kaizen",name:t.bound("suggestions","report:series:kaizen"),data:[],color:a}];return e.forEach(r,function(e){o[0].data.push(e[3]),o[1].data.push(e[4])}),o},prepareConfirmerSeries:function(r){return[{id:"entry",name:t.bound("suggestions","report:series:entry"),data:e.map(r,function(e){return e[1]})}]}},{TABLE_AND_CHART_METRICS:u,fromQuery:function(t){return void 0===t.from&&void 0===t.to&&(t.from=r.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+t.from||void 0,to:+t.to||void 0,interval:t.interval||void 0,sections:e.isEmpty(t.sections)?[]:t.sections.split(","),categories:e.isEmpty(t.categories)?[]:t.categories.split(",")})}})});
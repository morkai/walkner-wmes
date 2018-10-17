// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model","../data/colorFactory"],function(e,r,o,t,s){"use strict";var i=["total","countBySection","countByObserverSection","safeBySection","riskyBySection","categories"];return t.extend({urlRoot:"/behaviorObsCards/reports/count",nlsDomain:"behaviorObsCards",defaults:function(){return{from:0,to:0,interval:"month",sections:[],observerSections:[],superior:"",company:[],shift:0}},fetch:function(r){return e.isObject(r)||(r={}),r.data=e.extend(r.data||{},e.pick(this.attributes,["from","to","interval","sections","observerSections","superior","company","shift"])),r.data.sections=r.data.sections.join(","),r.data.observerSections=r.data.observerSections.join(","),r.data.company=r.data.company.join(","),t.prototype.fetch.call(this,r)},genClientUrl:function(){return"/behaviorObsCardCountReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&sections="+this.get("sections")+"&observerSections="+this.get("observerSections")+"&superior="+this.get("superior")+"&company="+this.get("company")+"&shift="+this.get("shift")},parse:function(r){var o=this,t=r.totals,s={total:{rows:o.prepareTotalRows(t),series:o.prepareTotalSeries()},observer:{categories:this.prepareUserCategories(r.users,t.observers),series:this.prepareObserverSeries(t.observers,r.groups)}};return e.forEach(i,function(e){s[e]||(s[e]="categories"===e?{rows:o.prepareRows(t.risky,t.categories,"categories",r.categories),series:{}}:{rows:o.prepareRows(t[e.replace("BySection","")],t[e],"sections",r.sections),series:{}})}),e.forEach(r.groups,function(r){var t;"number"==typeof r?(t=r,r={key:t,type:{}}):t=r.key,s.total.series.behaviorObsCard.data.push({x:t,y:r.count||null}),e.forEach(i,function(e){o.createSeriesFromRows(e,s,r)})}),s},prepareTotalRows:function(e){return[{id:"behaviorObsCard",abs:e.count,rel:1,color:"#5bc0de"}]},prepareTotalSeries:function(){return{behaviorObsCard:{data:[],color:"#5bc0de"}}},prepareRows:function(e,o,t,i){var a={id:"total",abs:0,rel:1,color:"#DDD",label:r("behaviorObsCards","report:series:total")},n=o.map(function(r){return a.abs+=r[1],{id:r[0],abs:r[1],rel:r[1]/e,color:s.getColor("behaviorObsCards/count/"+t,r[0]),label:i[r[0]]}});return n.push(a),n},createSeriesFromRows:function(r,o,t){var s=o[r].series;e.forEach(o[r].rows,function(e){s[e.id]||(s[e.id]={name:e.label,data:[],color:e.color}),s[e.id].data.push({x:t.key,y:t[r]?t[r][e.id]||null:null})})},prepareUserCategories:function(e,r){return r.map(function(r){var o=r[0];return e[o]||o})},prepareObserverSeries:function(o){var t=[{id:"behaviorObsCards",name:r.bound("behaviorObsCards","report:series:card"),data:[],color:"#5bc0de"}];return e.forEach(o,function(e){t[0].data.push(e[1])}),t}},{TABLE_AND_CHART_METRICS:i,fromQuery:function(r){return void 0===r.from&&void 0===r.to&&(r.from=o.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+r.from||void 0,to:+r.to||void 0,interval:r.interval||void 0,sections:e.isEmpty(r.sections)?[]:r.sections.split(","),observerSections:e.isEmpty(r.observerSections)?[]:r.observerSections.split(","),superior:r.superior||"",company:e.isEmpty(r.company)?[]:r.company.split(","),shift:+r.shift||0})}})});
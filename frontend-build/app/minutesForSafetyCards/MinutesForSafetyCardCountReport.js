define(["underscore","../i18n","../time","../core/Model","../data/colorFactory"],function(e,r,t,o,n){"use strict";var s=["total","countBySection","owners","confirmers","participants","engaged"],i={owners:!0,confirmers:!0,participants:!0,engaged:!0};return o.extend({urlRoot:"/minutesForSafetyCards/reports/count",nlsDomain:"minutesForSafetyCards",defaults:function(){return{from:0,to:0,interval:"month",sections:[],owner:"",confirmer:""}},fetch:function(r){return e.isObject(r)||(r={}),r.data=e.assign(r.data||{},e.pick(this.attributes,["from","to","interval","sections","owner","confirmer"])),r.data.sections=r.data.sections.join(","),o.prototype.fetch.call(this,r)},genClientUrl:function(){return"/minutesForSafetyCardCountReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&sections="+this.get("sections")+"&owner="+this.get("owner")+"&confirmer="+this.get("confirmer")},parse:function(r){var t=this,o=r.totals,n={total:{rows:t.prepareTotalRows(o),series:t.prepareTotalSeries()}};return e.forEach(s,function(e){n[e]||(n[e]=i[e]?{categories:t.prepareUserCategories(r.users,o[e]),series:t.prepareOwnerSeries(o[e],r.groups)}:{rows:t.prepareRows(o[e.replace("BySection","")],o[e],"sections",r.sections),series:{}})}),e.forEach(r.groups,function(r){var o;"number"==typeof r?r={key:o=r,type:{}}:o=r.key,n.total.series.minutesForSafetyCard.data.push({x:o,y:r.count||null}),e.forEach(s,function(e){t.createSeriesFromRows(e,n,r)})}),n},prepareTotalRows:function(e){return[{id:"minutesForSafetyCard",abs:e.count,rel:1,color:"#5cb85c"}]},prepareTotalSeries:function(){return{minutesForSafetyCard:{data:[],color:"#5cb85c"}}},prepareRows:function(e,t,o,s){var i={id:"total",abs:0,rel:1,color:"#DDD",label:r(this.nlsDomain,"report:series:total")},a=t.map(function(r){return i.abs+=r[1],{id:r[0],abs:r[1],rel:r[1]/e,color:n.getColor("minutesForSafetyCards/count/"+o,r[0]),label:s[r[0]]}});return a.push(i),a},createSeriesFromRows:function(r,t,o){var n=t[r].series;e.forEach(t[r].rows,function(e){n[e.id]||(n[e.id]={name:e.label,data:[],color:e.color}),n[e.id].data.push({x:o.key,y:o[r]&&o[r][e.id]||null})})},prepareUserCategories:function(e,r){return r.map(function(r){var t=r[0];return e[t]||t})},prepareOwnerSeries:function(t){var o=[{id:"minutesForSafetyCards",name:r.bound(this.nlsDomain,"report:series:card"),data:[],color:"#5cb85c"}];return e.forEach(t,function(e){o[0].data.push(e[1])}),o}},{TABLE_AND_CHART_METRICS:s,USERS_METRICS:i,fromQuery:function(r){return void 0===r.from&&void 0===r.to&&(r.from=t.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+r.from||void 0,to:+r.to||void 0,interval:r.interval||void 0,sections:e.isEmpty(r.sections)?[]:r.sections.split(","),owner:r.owner||"",confirmer:r.confirmer||""})}})});
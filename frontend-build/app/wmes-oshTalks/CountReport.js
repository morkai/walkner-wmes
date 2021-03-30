define(["underscore","../i18n","../time","../core/Model","../data/colorFactory"],function(t,r,e,o,s){"use strict";var a=["total","countBySection","topics"];return o.extend({urlRoot:"/oshTalks/reports/count",nlsDomain:"wmes-oshTalks",defaults:function(){return{from:0,to:0,interval:"month",sections:[],auditor:""}},fetch:function(r){return t.isObject(r)||(r={}),r.data=t.assign(r.data||{},t.pick(this.attributes,["from","to","interval","sections","auditor"])),r.data.sections=r.data.sections.join(","),o.prototype.fetch.call(this,r)},genClientUrl:function(){return"/oshTalkCountReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&sections="+this.get("sections")+"&auditor="+this.get("auditor")},parse:function(r){var e=this,o=r.totals,s={total:{rows:[{id:"talk",abs:o.count,rel:1,color:"#337ab7"}],series:{talk:{data:[],color:"#337ab7"}}},auditors:{categories:this.prepareUserCategories(r.users,o.auditors),series:this.prepareAuditorSeries(o.auditors,r.groups)},participants:{categories:this.prepareUserCategories(r.users,o.participants),series:this.prepareParticipantSeries(o.participants,r.groups)}};return t.forEach(a,function(t){if(!s[t]){var a=o[t.replace("BySection","").replace("ByTopic","")],i=o[t],n="sections",c=r.sections;"topics"===t&&(n="topics",c=r.topics),s[t]={rows:e.prepareRows(a,i,n,c),series:{}}}}),t.forEach(r.groups,function(r){var o;"number"==typeof r?r={key:o=r,type:{}}:o=r.key,s.total.series.talk.data.push({x:o,y:r.count||null}),t.forEach(a,function(t){e.createSeriesFromRows(t,s,r)})}),s},prepareRows:function(t,e,o,a){var i=this.nlsDomain,n={id:"total",abs:0,rel:1,color:"#DDD",label:r(i,"report:series:total")},c=e.map(function(e){var c;return n.abs+=e[1],c="statuses"===o?r(i,"status:"+e[0]):a[e[0]]||e[0],{id:e[0],abs:e[1],rel:e[1]/t,color:s.getColor("oshTalks/count/"+o,e[0]),label:c}});return c.push(n),c},createSeriesFromRows:function(r,e,o){var s=e[r].series;t.forEach(e[r].rows,function(t){"total"!==t.id&&(s[t.id]||(s[t.id]={name:t.label,data:[],color:t.color}),s[t.id].data.push({x:o.key,y:o[r]&&o[r][t.id]||null}))})},prepareUserCategories:function(t,r){return r.map(function(r){var e=r[0];return t[e]||e})},prepareAuditorSeries:function(e){var o=[{id:"talk",name:r(this.nlsDomain,"report:series:talk"),data:[],color:"#337ab7"}];return t.forEach(e,function(t){o[0].data.push(t[1])}),o},prepareParticipantSeries:function(e){var o=[{id:"talk",name:r(this.nlsDomain,"report:series:talk"),data:[],color:"#337ab7"}];return t.forEach(e,function(t){o[0].data.push(t[1])}),o}},{TABLE_AND_CHART_METRICS:a,fromQuery:function(r){return void 0===r.from&&void 0===r.to&&(r.from=e.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+r.from||void 0,to:+r.to||void 0,interval:r.interval||void 0,sections:t.isEmpty(r.sections)?[]:r.sections.split(","),auditor:r.auditor||""})}})});
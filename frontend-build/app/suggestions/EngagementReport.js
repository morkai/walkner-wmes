define(["underscore","../i18n","../time","../core/Model"],function(s,t,e,o){"use strict";return o.extend({urlRoot:"/suggestions/reports/engagement",nlsDomain:"suggestions",defaults:function(){return{from:0,to:0,status:[],interval:"month",sections:[]}},fetch:function(t){return s.isObject(t)||(t={}),t.data=s.assign(t.data||{},s.pick(this.attributes,["from","to","status","interval","sections"])),t.data.status=t.data.status.join(","),t.data.sections=t.data.sections.join(","),o.prototype.fetch.call(this,t)},genClientUrl:function(){return"/suggestions/reports/engagement?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&status="+this.get("status")+"&sections="+this.get("sections")},parse:function(t){var e={groups:[]};return s.forEach(t.groups,function(n,i){var a={nearMisses:0,osh:0,suggestions:0,observations:0,minutes:0,audits:0,talks:0,total:0,users:{nearMisses:0,osh:0,suggestions:0,observations:0,minutes:0,audits:0,talks:0,total:0}};n={key:+i,totals:a,users:s.map(n,function(s,e){return a.nearMisses+=s.nearMisses,a.osh+=s.osh,a.suggestions+=s.suggestions,a.observations+=s.observations,a.minutes+=s.minutes,a.audits+=s.audits,a.talks+=s.talks,a.users.nearMisses+=s.nearMisses?1:0,a.users.osh+=s.osh?1:0,a.users.suggestions+=s.suggestions?1:0,a.users.observations+=s.observations?1:0,a.users.minutes+=s.minutes?1:0,a.users.audits+=s.audits?1:0,a.users.talks+=s.talks?1:0,a.users.total+=1,s.total=0,o(s),{name:t.users[e]||e,nearMisses:s.nearMisses,osh:s.osh,suggestions:s.suggestions,observations:s.observations,minutes:s.minutes,audits:s.audits,talks:s.talks,total:s.total,sections:Object.keys(s.sections).map(function(s){return t.sections[s]||s})}})},o(a),n.users.sort(function(s,t){return s.name.localeCompare(t.name)}),e.groups.push(n)}),e.groups.sort(function(s,t){return s.key-t.key}),e.groups.length&&(this.attributes.groups=[]),e;function o(s){s.total+=s.nearMisses+s.osh+s.observations+s.minutes+s.audits+s.talks}},serializeToCsv:function(){var t=["date;name;nearMisses;osh;observations;minutes;audits;talks;suggestions;sections"];return s.forEach(this.get("groups"),function(o){var n=e.format(o.key,"YYYY-MM-DD")+";";s.forEach(o.users,function(s){t.push(n+'"'+s.name+'";'+s.nearMisses+'";'+s.osh+";"+s.observations+";"+s.minutes+";"+s.audits+";"+s.talks+";"+s.suggestions+';"'+s.sections.join(",")+'"')})}),t.join("\r\n")}},{COUNTERS:["nearMisses","osh","observations","minutes","audits","talks","total","suggestions"],fromQuery:function(t){return void 0===t.from&&void 0===t.to&&(t.from=e.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+t.from||void 0,to:+t.to||void 0,interval:t.interval||"month",status:s.isEmpty(t.status)?[]:t.status.split(","),sections:s.isEmpty(t.sections)?[]:t.sections.split(",")})}})});
define(["underscore","../i18n","../time","../core/Model"],function(s,t,e,n){"use strict";return n.extend({urlRoot:"/suggestions/reports/engagement",nlsDomain:"suggestions",defaults:function(){return{from:0,to:0,status:[],interval:"month",sections:[]}},fetch:function(t){return s.isObject(t)||(t={}),t.data=s.assign(t.data||{},s.pick(this.attributes,["from","to","status","interval","sections"])),t.data.status=t.data.status.join(","),t.data.sections=t.data.sections.join(","),n.prototype.fetch.call(this,t)},genClientUrl:function(){return"/suggestionEngagementReport?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&status="+this.get("status")+"&sections="+this.get("sections")},parse:function(t){var e={groups:[]};return s.forEach(t.groups,function(n,o){var i={name:0,nearMisses:0,suggestions:0,behaviorObs:0,minutesForSafety:0};(n={key:+o,totals:i,users:s.map(n,function(s,e){return i.name+=1,i.nearMisses+=s.nearMisses,i.suggestions+=s.suggestions,i.behaviorObs+=s.behaviorObs,i.minutesForSafety+=s.minutesForSafety,{name:t.users[e],nearMisses:s.nearMisses,suggestions:s.suggestions,behaviorObs:s.behaviorObs,minutesForSafety:s.minutesForSafety,sections:Object.keys(s.sections).map(function(s){return t.sections[s]||s})}})}).users.sort(function(s,t){return s.name.localeCompare(t.name)}),e.groups.push(n)}),e.groups.sort(function(s,t){return s.key-t.key}),e.groups.length&&(this.attributes.groups=[]),e},serializeToCsv:function(){var t=["date;name;nearMisses;suggestions;behaviorObs;minutesForSafety;sections"];return s.forEach(this.get("groups"),function(n){var o=e.format(n.key,"YYYY-MM-DD")+";";s.forEach(n.users,function(s){t.push(o+'"'+s.name+'";'+s.nearMisses+";"+s.suggestions+";"+s.behaviorObs+";"+s.minutesForSafety+';"'+s.sections.join(",")+'"')})}),t.join("\r\n")}},{fromQuery:function(t){return void 0===t.from&&void 0===t.to&&(t.from=e.getMoment().startOf("month").subtract(3,"months").valueOf()),new this({from:+t.from||void 0,to:+t.to||void 0,interval:t.interval||"month",status:s.isEmpty(t.status)?[]:t.status.split(","),sections:s.isEmpty(t.sections)?[]:t.sections.split(",")})}})});
// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/i18n","app/user","app/core/views/ListView","app/planning/templates/list"],function(n,e,t,r,i,s){"use strict";return i.extend({template:s,remoteTopics:{},events:{"mousedown .planning-list-day":function(n){1===n.button&&n.preventDefault()},"mouseup .planning-list-day":function(n){if(!n.currentTarget.classList.contains("is-empty")){var e="#planning/plans/"+n.currentTarget.dataset.id;return 0===n.button?window.location.href=e:1===n.button&&window.open(e),!1}}},serialize:function(){var n=i.prototype.serialize.apply(this,arguments),e=n.rows[0].moment.clone().subtract(1,"days"),t=e.clone().subtract(6,"days");return n.prevLink="#planning/plans?select(mrps._id,mrps.lines._id,mrps.lines.workerCount)&_id>="+t.valueOf()+"&_id<="+e.valueOf(),t=n.rows[6].moment.clone().add(1,"days"),e=t.clone().add(6,"days"),n.nextLink="#planning/plans?select(mrps._id,mrps.lines._id,mrps.lines.workerCount)&_id>="+t.valueOf()+"&_id<="+e.valueOf(),n},serializeColumns:function(){return[]},serializeRows:function(){for(var t=n.find(this.collection.rqlQuery.selector.args,function(n){return"ge"===n.name&&"_id"===n.args[0]}).args[1],r=[],i={},s=0;s<7;++s){var a=e.utc.getMoment(t).add(s,"days"),o={moment:a,date:a.format("YYYY-MM-DD"),mrps:[]};i[o.moment.valueOf()]=o,r.push(o)}return this.collection.forEach(function(n){var e=i[Date.parse(n.id)];e&&n.mrps.forEach(function(n){e.mrps.push({_id:n.id,lines:n.lines.map(function(n){return{_id:n.id,workerCount:n.get("workerCount")}})})})}),r.forEach(function(n){n.mrps.sort(function(n,e){return n._id.localeCompare(e._id)})}),r}})});
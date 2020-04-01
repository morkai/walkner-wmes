define(["underscore","../time","../core/Model","../core/Collection","./Plan","./settings"],function(t,e,i,n,s,r){"use strict";var o=i.extend({defaults:function(){return{mrpPriority:[],activeFrom:"",activeTo:""}}}),l=n.extend({model:o}),a=i.extend({defaults:function(){return{locked:!1,limitSmallOrders:!1,extraOrderSeconds:0,extraShiftSeconds:[0,0,0],bigOrderQuantity:0,splitOrderQuantity:0,maxSplitLineCount:0,hardOrderManHours:0,hardBigComponents:[],hardComponents:[],lines:[],groups:[]}},initialize:function(){this.lines=new d(null,{paginate:!1}),this.attributes.lines&&(this.lines.reset(this.attributes.lines),delete this.attributes.lines)},toJSON:function(){return t.assign({lines:this.lines.toJSON()},this.attributes)}}),u=n.extend({model:a}),c=i.extend({defaults:function(){return{workerCount:[0,0,0],orderPriority:["small","easy","hard"]}}}),d=n.extend({model:c});return i.extend({urlRoot:"/planning/settings",clientUrlRoot:"#planning/settings",topicPrefix:"planning.settings",privilegePrefix:"PLANNING",nlsDomain:"planning",defaults:function(){return{useRemainingQuantity:!0,ignoreCompleted:!0,requiredStatuses:[],ignoredStatuses:[],ignoredWorkCenters:[],completedStatuses:[],schedulingRate:"",freezeHour:17,lateHour:6,etoPilotHour:6}},initialize:function(){this.lockedMrps=null,this.lockedLines=null,this.lines=new l(null,{paginate:!1}),this.mrps=new u(null,{paginate:!1}),this.global=r.acquire(),this.attributes.lines&&(this.lines.reset(this.attributes.lines),delete this.attributes.lines),this.attributes.mrps&&(this.mrps.reset(this.attributes.mrps),delete this.attributes.mrps),this.attributes.global&&(this.global.reset(this.global.parse(this.attributes)),delete this.attributes.global),this.on("sync",function(){this.lockedMrps=null,this.lockedLines=null})},parse:function(i){var n=t.omit(i,["lines","mrps"]);return i._id&&(n._id=e.utc.format(i._id,"YYYY-MM-DD")),i.lines&&(this.lines?this.lines.reset(i.lines):n.lines=i.lines),i.mrps&&(this.mrps?this.mrps.reset(i.mrps):n.mrps=i.mrps),i.global&&(this.global?this.global.reset(this.global.parse(i)):n.global=i.global),n},toJSON:function(){return t.assign({lines:this.lines.toJSON(),mrps:this.mrps.toJSON(),global:this.global.toJSON()},this.attributes)},getLabel:function(){return e.utc.format(this.id,"LL")},getDefinedMrpIds:function(){return this.mrps.map(function(t){return t.id}).sort(function(t,e){return t.localeCompare(e,void 0,{numeric:!0})})},getSchedulingRate:function(t){return this.attributes.schedulingRate[t]||this.attributes.schedulingRate.ANY||1},isEditable:function(){return e.getMoment(this.id).hours(6).diff(Date.now())>3e5},applyChanges:function(t){s.applySettingsChanges(this,t)},hasAllRequiredStatuses:function(e){var i=this.get("requiredStatuses");return t.intersection(i,e).length===i.length},hasAnyIgnoredStatus:function(e){return t.intersection(this.get("ignoredStatuses"),e).length>0},isLineLocked:function(t){return this.cacheLocked(),!!this.lockedLines[t]},isMrpLocked:function(t){return this.cacheLocked(),!!this.lockedMrps[t]},isMrpLockedDirectly:function(t){var e=this.mrps.get(t);return!!e&&e.get("locked")},getMrpLockReason:function(t){var e=this;if(!e.isMrpLocked(t))return null;var i=e.isMrpLockedDirectly(t),n=[];return e.mrps.get(t).lines.forEach(function(i){var s=e.lines.get(i.id),r=s.get("mrpPriority").filter(function(i){return i!==t&&e.isMrpLockedDirectly(i)});r.length&&n.push({line:s.id,mrps:r})}),{mrp:i,lines:n}},cacheLocked:function(){var e=this;if(!e.lockedMrps){e.lockedMrps={},e.lockedLines={};var i={},n={};e.mrps.forEach(function(t){t.get("locked")&&(e.lockedMrps[t.id]=!0),i[t.id]=[]}),e.lines.forEach(function(t){var e=t.id;n[e]=[],t.get("mrpPriority").forEach(function(t){i[t].push(e),n[e].push(t)})}),t.forEach(n,function(i){t.some(i,function(t){return!!e.lockedMrps[t]})&&i.forEach(function(t){e.lockedMrps[t]=!0})}),t.forEach(i,function(t,i){e.lockedMrps[i]&&t.forEach(function(t){e.lockedLines[t]=!0})})}}},{fromDate:function(t){var i=e.utc.getMoment().startOf("day");return/^-?[0-9]+d$/.test(t)&&(t=i.add(+t.replace("d",""),"days").format("YYYY-MM-DD")),new this({_id:t})}})});
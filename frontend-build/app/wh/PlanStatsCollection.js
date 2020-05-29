define(["app/time","app/core/Collection","app/planning/util/shift"],function(t,i,n){"use strict";function s(i){var n=[];i.stats.forEach(function(t){n.push(!!t.startAt)});var s=t.utc.getMoment(i._id);return{_id:s.format("YYYY-MM-DD"),date:s.toDate(),workingShifts:n}}return i.extend({paginate:!1,initialize:function(){this.firstWorkingPlans={},this.on("sync",function(){this.firstWorkingPlans={}})},url:function(){return"/planning/plans?select(stats.startAt,stats.finishAt)&sort(_id)&limit(0)&_id>="+n.getPlanDate(Date.now(),!0).subtract(7,"days").valueOf()},parse:function(t){return(t.collection||[]).map(s)},update:function(t,i){this.firstWorkingPlans={},this.get(t)||this.add({_id:t}),this.get(t).set(s({_id:t,stats:i}))},getFirstWorkingPlanBefore:function(i){var n=i instanceof Date?i.getTime():i;if(void 0!==this.firstWorkingPlans[n])return this.firstWorkingPlans[n];for(var s=t.utc.getMoment(n).startOf("day");;){var r=s.subtract(24,"hours").format("YYYY-MM-DD"),a=this.get(r);if(!a)return this.firstWorkingPlans[n]=null,null;if(a.get("workingShifts")[0])return this.firstWorkingPlans[n]=a,a}}},{parse:s})});
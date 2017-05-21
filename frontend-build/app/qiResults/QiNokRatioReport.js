// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model"],function(t,i,e,n){"use strict";return n.extend({urlRoot:"/qi/reports/nokRatio",defaults:function(){return{from:0,to:0,kinds:[]}},fetch:function(i){t.isObject(i)||(i={});var e=i.data=t.extend(i.data||{},t.pick(this.attributes,["from","to","kinds"]));return e.kinds=e.kinds.join(","),n.prototype.fetch.call(this,i)},genClientUrl:function(){return"/qi/reports/nokRatio?from="+this.get("from")+"&to="+this.get("to")+"&kinds="+this.get("kinds")},parse:function(t){return{divisions:t.options.divisions,total:t.total,division:t.division}}},{fromQuery:function(i){var n=e.getMoment(+i.from).startOf("month"),o=e.getMoment(+i.to).startOf("month");return n.isValid()&&o.isValid()||(n.isValid()?o=n.clone().add(1,"years"):o.isValid()?n=o.clone().subtract(1,"years"):(n=e.getMoment().startOf("year"),o=n.clone().add(1,"years"))),(n.valueOf()===o.valueOf()||o.valueOf()<n.valueOf())&&(o=n.clone().add(1,"years")),new this({from:n.valueOf(),to:o.valueOf(),kinds:t.isEmpty(i.kinds)?[]:i.kinds.split(",")})}})});
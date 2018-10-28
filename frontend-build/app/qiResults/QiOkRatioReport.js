define(["underscore","../i18n","../time","../core/Model"],function(t,e,o,r){"use strict";return r.extend({urlRoot:"/qi/reports/okRatio",defaults:function(){return{interval:"month",from:0,to:0}},fetch:function(e){return t.isObject(e)||(e={}),e.data=t.extend(e.data||{},t.pick(this.attributes,["from","to"])),r.prototype.fetch.call(this,e)},genClientUrl:function(){return"/qi/reports/okRatio?from="+this.get("from")+"&to="+this.get("to")},parse:function(t){return{divisions:t.options.divisions,total:t.total,groups:t.groups}}},{fromQuery:function(t){var e=o.getMoment(+t.from).startOf("month"),r=o.getMoment(+t.to).startOf("month");return e.isValid()&&r.isValid()||(e.isValid()?r=e.clone().add(1,"years"):r.isValid()?e=r.clone().subtract(1,"years"):r=(e=o.getMoment().startOf("year")).clone().add(1,"years")),(e.valueOf()===r.valueOf()||r.valueOf()<e.valueOf())&&(r=e.clone().add(1,"years")),new this({from:e.valueOf(),to:r.valueOf()})}})});
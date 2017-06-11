// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../settings/SettingCollection","./PlanningSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:["planning.**","production.**"],getValue:function(e){var t=this.get(e)||this.get("planning."+e)||this.get("production."+e);return t?t.getValue():null},prepareValue:function(e,t){return/perOrderOverhead$/.test(e)?(t=parseInt(t,10),t>=0&&t<=600?t:void 0):/shiftStartDowntime[0-9]|bigOrderQty$/.test(e)?(t=parseInt(t,10),t>=0&&t<=1800?t:void 0):/ignore|qtyRemaining/.test(e)?!!t:void 0},getPlanGeneratorSettings:function(e){return{perOrderOverhead:1e3*(this.getValue("perOrderOverhead")||0),shiftStartDowntime:{1:1e3*(this.getValue("shiftStartDowntime1")||0),2:1e3*(this.getValue("shiftStartDowntime2")||0),3:1e3*(this.getValue("shiftStartDowntime3")||0)},qtyRemaining:!!this.getValue("qtyRemaining"),ignoreDlv:!!this.getValue("ignoreDlv"),ignoreCnf:!!this.getValue("ignoreCnf"),ignoreDone:!!this.getValue("ignoreDone"),bigOrderQty:this.getValue("bigOrderQty")||0,lineAutoDowntimes:this.getLineAutoDowntimes(e)}},getLineAutoDowntimes:function(t){var n={};return(this.getValue("production.lineAutoDowntimes")||[]).forEach(function(i){e.forEach(i.lines,function(r){t&&!e.includes(t,r)||(n[r]=i.downtimes)})}),n}})});
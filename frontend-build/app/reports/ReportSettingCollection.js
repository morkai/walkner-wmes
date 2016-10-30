// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../settings/SettingCollection","./util/prepareDateRange","./ReportSetting"],function(e,t,r,n){"use strict";return t.extend({model:n,topicSuffix:"reports.**",getValue:function(e){var t=this.get("reports."+e);return t?t.getValue():null},getColor:function(e,t){var r=this.getValue(e+".color")||"#000000";if(!t)return r;var n=r.match(/^#(.{2})(.{2})(.{2})$/);return n?"rgba("+parseInt(n[1],16)+","+parseInt(n[2],16)+","+parseInt(n[3],16)+","+t+")":r},getReference:function(e,t){return this.getValue(e+"."+t)||0},getCoeff:function(e){var t=this.getValue(e+".coeff");return t>0?t:0},getDefaultDowntimeAors:function(){var t=this.getValue("downtimesInAors.aors")||"own";return"own"===t?e.data.aors||[]:t.split(",").filter(function(e){return e.length>0})},getDefaultDowntimeStatuses:function(){return(this.getValue("downtimesInAors.statuses")||"confirmed").split(",")},getDateRange:function(e){var t=r(this.getValue(e)||"currentWeek");return{from:t.fromMoment.format("YYYY-MM-DD"),to:t.toMoment.format("YYYY-MM-DD"),interval:t.interval}},prepareValue:function(e,t){return/color/i.test(e)?this.prepareColorValue(t):/coeff/i.test(e)?this.prepareCoeffValue(t):/(id|prodTask|specificAor)$/i.test(e)?this.prepareObjectIdValue(t):/downtimesInAors.aors$/.test(e)?this.prepareDowntimeAorsValue(t):/downtimesInAors.statuses$/.test(e)?this.prepareDowntimeStatusesValue(t):/(interval|dateRange)$/i.test(e)?t:/lean/.test(e)?this.prepareLeanValue(e,t):this.prepare100PercentValue(t)},prepareLeanValue:function(e,t){return/(DowntimeReasons|ProdTasks|ProdFlows)$/.test(e)?""===t?[]:t.split(","):/(Den|Threshold|Plan)$/.test(e)?this.prepareCoeffValue(t):t},prepare100PercentValue:function(e){return""===e?0:(e=parseInt(e,10),isNaN(e)?void 0:e<0?0:e>100?100:e)},prepareCoeffValue:function(e){return""===e?0:(e=parseFloat(e),isNaN(e)?void 0:e<0?0:Math.round(1e4*e)/1e4)},prepareColorValue:function(e){if(e=e.toLowerCase(),/^#[a-f0-9]{6}$/.test(e))return e},prepareDowntimeAorsValue:function(e){return"own"===e?e:e.split(",").filter(function(e){return/^[a-f0-9]{24}$/.test(e)}).join(",")},prepareDowntimeStatusesValue:function(e){var t=(Array.isArray(e)?e:e.split(",")).filter(function(e){return"undecided"===e||"rejected"===e||"confirmed"===e});return t.length?t.join(","):"confirmed"}})});
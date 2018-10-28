define(["underscore","../time","../user","../core/Model"],function(t,s,e,i){"use strict";return i.extend({defaults:function(){return{specificAor:null,aors:null,statuses:null,limit:8,skip:0,customTimes:!1,clipFrom:null,clipTo:null,clipInterval:null,dtlFrom:null,dtlTo:null,dtcFrom:null,dtcTo:null,dtcInterval:null}},initialize:function(t,s){if(!s.settings)throw new Error("settings option is required!");this.settings=s.settings,this.settings.isEmpty()?this.listenToOnce(this.settings,"reset",this.setDefaultsFromSettings):this.setDefaultsFromSettings()},setDefaultsFromSettings:function(){var t=this.settings,s=this.attributes;null===s.specificAor&&(s.specificAor=t.getValue("downtimesInAors.specificAor")),null===s.aors&&(s.aors=t.getDefaultDowntimeAors()),null===s.statuses&&(s.statuses=t.getDefaultDowntimeStatuses()),s.customTimes||(s.clipFrom=null,s.clipTo=null,s.clipInterval=null,s.dtlFrom=null,s.dtlTo=null,s.dtcFrom=null,s.dtcTo=null,s.dtcInterval=null),this.set({},{silent:!0})},serializeToObject:function(){var t={specificAor:this.get("specificAor")||"",aors:(this.get("aors")||[]).join(","),statuses:"confirmed"};return this.applyCustomClipTimes(t),this.applyCustomDtcTimes(t),t},serializeToString:function(){var t="",s=this.attributes;return s.customTimes&&(t+="&customTimes=1&clipFrom="+s.clipFrom+"&clipTo="+s.clipTo+"&clipInterval="+s.clipInterval+"&dtlFrom="+s.dtlFrom+"&dtlTo="+s.dtlTo+"&dtcFrom="+s.dtcFrom+"&dtcTo="+s.dtcTo+"&dtcInterval="+s.dtcInterval),s.aors&&(t+="&aors="+s.aors),(t+="&specificAor="+s.specificAor+"&statuses="+s.statuses+"&limit="+s.limit+"&skip="+s.skip).substr(1)},createProdDowntimesSelector:function(){var e=this.get("statuses")||[],i=t.unique((this.get("aors")||[]).concat(this.get("specificAor"))).filter(function(t){return!!t}),r=this.applyCustomDtlTimes({}),o={name:"and",args:[]};return o.args.push({name:"ge",args:["startedAt",s.getMoment(r.dtlFrom,"YYYY-MM-DD").hours(6).valueOf()]},{name:"lt",args:["startedAt",s.getMoment(r.dtlTo,"YYYY-MM-DD").hours(6).valueOf()]}),2===e.length?o.args.push({name:"in",args:["status",e]}):1===e.length&&o.args.push({name:"eq",args:["status",e[0]]}),1===i.length?o.args.push({name:"eq",args:["aor",i[0]]}):i.length>0&&o.args.push({name:"in",args:["aor",i]}),o},getDowntimesChartInterval:function(){return this.applyCustomDtcTimes({}).dtcInterval},getCustomTimes:function(){var t={};return this.applyCustomClipTimes(t),this.applyCustomDtlTimes(t),this.applyCustomDtcTimes(t),t},setCustomTimes:function(t){t.customTimes=!0,this.set(t,{reset:!0})},resetCustomTimes:function(s){this.set(t.extend(s,{customTimes:!1}),{reset:!0})},applyCustomClipTimes:function(t){var s=this.get("clipFrom"),e=this.get("clipTo"),i=this.get("clipInterval");if(!this.get("customTimes")){var r=this.settings.getDateRange("downtimesInAors.clipDateRange");s=r.from,e=r.to,i=this.settings.getValue("downtimesInAors.clipInterval")||r.interval}return t.clipFrom=s,t.clipTo=e,t.clipInterval=i,t},applyCustomDtlTimes:function(t){var s=this.get("dtlFrom"),e=this.get("clipTo");if(!this.get("customTimes")){var i=this.settings.getDateRange("downtimesInAors.dtlDateRange");s=i.from,e=i.to}return t.dtlFrom=s,t.dtlTo=e,t},applyCustomDtcTimes:function(t){var s=this.get("dtcFrom"),e=this.get("dtcTo"),i=this.get("dtcInterval");if(!this.get("customTimes")){var r=this.settings.getDateRange("downtimesInAors.dtcDateRange");s=r.from,e=r.to,i=this.settings.getValue("downtimesInAors.dtcInterval")||r.interval}return t.dtcFrom=s,t.dtcTo=e,t.dtcInterval=i,t}},{prepareAttrsFromQuery:function(t){return{specificAor:void 0===t.specificAor?null:t.specificAor,aors:void 0===t.aors?null:t.aors.split(","),statuses:void 0===t.statuses?null:t.statuses.split(","),limit:parseInt(t.limit,10)||void 0,skip:parseInt(t.skip,10)||void 0,customTimes:"1"===t.customTimes,clipFrom:t.clipFrom,clipTo:t.clipTo,clipInterval:t.clipInterval,dtlFrom:t.dtlFrom,dtlTo:t.dtlTo,dtcFrom:t.dtcFrom,dtcTo:t.dtcTo,dtcInterval:t.dtcInterval}},fromQuery:function(t,s){return new this(this.prepareAttrsFromQuery(t),s)}})});
define(["jquery","../user","../settings/SettingCollection","./WhSetting"],function(t,e,n,r){"use strict";var i=new RegExp(["maxSetSize","minSetDuration","maxSetDuration","maxSetDifference","groupDuration","groupExtraItems"].join("|"));return n.extend({model:r,topicSuffix:"wh.**",getValue:function(t){var e=this.get("wh."+t);return e?e.getValue():null},prepareValue:function(t,e){return i.test(t)?(e=Math.round(parseInt(e,10)),isNaN(e)||e<0?0:e):/ignoredMrps/.test(t)?e.split(",").filter(function(t){return!!t.length}):/ignorePsStatus/.test(t)?!!e:void 0}})});
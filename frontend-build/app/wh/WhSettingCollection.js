// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../user","../settings/SettingCollection","./WhSetting"],function(t,e,n,r){"use strict";return n.extend({model:r,topicSuffix:"wh.**",getValue:function(t){var e=this.get("wh."+t);return e?e.getValue():null},prepareValue:function(t,e){return/group(Duration|ExtraItems)/.test(t)?(e=Math.round(parseInt(e,10)),isNaN(e)||e<0?0:e):/ignoredMrps/.test(t)?e.split(",").filter(function(t){return!!t.length}):void 0}})});
define(["underscore","../settings/SettingCollection","./Setting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"luma2.**",getValue:function(e){var t=this.get("luma2."+e);return t?t.getValue():null},prepareValue:function(e,t){if(/Time$/.test(e))return Math.min(3600,Math.max(1,parseInt(t,10)||1))}})});
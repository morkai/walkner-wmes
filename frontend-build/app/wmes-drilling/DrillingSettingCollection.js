define(["underscore","../settings/SettingCollection","./DrillingSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"drilling.**",getValue:function(e){var t=this.get("drilling."+e);return t?t.getValue():null},prepareValue:function(e,t){if(/workCenters$/i.test(e))return t.split(",").filter(function(e){return e.length>0})}})});
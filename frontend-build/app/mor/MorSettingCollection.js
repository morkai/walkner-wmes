define(["../settings/SettingCollection","./MorSetting"],function(t,e){"use strict";return t.extend({model:e,topicSuffix:"mor.**",getValue:function(t){var e=this.get("mor."+t);return e?e.getValue():null},prepareValue:function(t,e){if(/prodFunctions$/i.test(t))return e.split(",").filter(function(t){return!!t.length})}})});
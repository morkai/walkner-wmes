define(["underscore","app/user","app/settings/SettingCollection","./Setting"],function(n,e,r,t){"use strict";return r.extend({model:t,idPrefix:"dummyPaint.",topicSuffix:"dummyPaint.**",prepareValue:function(n,e){if(/(nonAkzo|nonRal)/.test(n))return Array.isArray(e)?e:"string"==typeof e?e.split(/[\n,]+/):[]},prepareFormValue:function(n,e){return Array.isArray(e)?e.join("\n"):e}})});
define(["jquery","../settings/SettingCollection","./XiconfSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"xiconf.**",getValue:function(e){var t=this.get("xiconf."+e);return t?t.getValue():null},prepareValue:function(e,t){return"boolean"==typeof t?t:/appVersion$/.test(e)?this.prepareVersionValue(t):/delay$/.test(e)?(t=parseInt(t,10),isNaN(t)?15:t<1?1:t>30?30:t):/(Filter|componentPatterns)$/.test(e)?t:void 0},prepareVersionValue:function(e){return e=e.trim(),/^[0-9]+\.[0-9]+\.[0-9]+(?:\-[a-z0-9]+(?:\.[0-9]+)?)?/.test(e)?e:void 0}})});
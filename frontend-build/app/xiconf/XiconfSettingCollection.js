// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","../settings/SettingCollection","./XiconfSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"xiconf.**",getValue:function(e){var t=this.get("xiconf."+e);return t?t.getValue():null},prepareValue:function(e,t){return/appVersion$/.test(e)?this.prepareVersionValue(t):void 0},prepareVersionValue:function(e){return e=e.trim(),/^[0-9]+\.[0-9]+\.[0-9]+(?:\-[a-z0-9]+(?:\.[0-9]+)?)?/.test(e)?e:void 0}})});
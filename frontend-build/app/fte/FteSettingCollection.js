// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","../settings/SettingCollection","./FteSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"fte.**",getValue:function(e){var t=this.get("fte."+e);return t?t.getValue():null},prepareValue:function(e,t){return t}})});
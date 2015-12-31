// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","../settings/SettingCollection","./FteSetting"],function(e,t,n){"use strict";return t.extend({model:n,topicSuffix:"fte.**",getValue:function(e){var t=this.get("fte."+e);return t?t.getValue():null},prepareValue:function(e,t){return t}})});
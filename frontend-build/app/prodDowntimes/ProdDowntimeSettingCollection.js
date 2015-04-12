// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","../settings/SettingCollection","./ProdDowntimeSetting"],function(t,e,n){"use strict";return e.extend({model:n,topicSuffix:"prodDowntimes.**",getValue:function(t){var e=this.get("prodDowntimes."+t);return e?e.getValue():null},prepareValue:function(t,e){return/autoConfirmHours/.test(t)?(e=Math.round(parseInt(e,10)),isNaN(e)||24>e?24:e):void 0}})});
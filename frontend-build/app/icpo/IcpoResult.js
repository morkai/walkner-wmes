// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","./util/decorateLogEntry"],function(t,e){"use strict";return t.extend({urlRoot:"/icpo/results",clientUrlRoot:"#icpo/results",privilegePrefix:"ICPO",nlsDomain:"icpo",getDecoratedLog:function(){var t=this.get("log");return Array.isArray(t)?t.map(e):[]},hasData:function(t){var e=this.get(t+"Data");return"string"==typeof e&&0!==e.length}})});
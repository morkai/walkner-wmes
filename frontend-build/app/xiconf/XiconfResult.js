// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","./util/decorateLogEntry"],function(e,t){return e.extend({urlRoot:"/xiconf/results",clientUrlRoot:"#xiconf/results",privilegePrefix:"XICONF",nlsDomain:"xiconf",getDecoratedLog:function(){var e=this.get("log");return Array.isArray(e)?e.map(t):[]},hasFeatureData:function(){var e=this.get("feature");return"string"==typeof e&&0!==e.length}})});
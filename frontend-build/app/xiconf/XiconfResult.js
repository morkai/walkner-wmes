// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model","./util/decorateLogEntry"],function(e,t){"use strict";return e.extend({urlRoot:"/xiconf/results",clientUrlRoot:"#xiconf/results",privilegePrefix:"XICONF",nlsDomain:"xiconf",getDecoratedLog:function(){var e=this.get("log");return Array.isArray(e)?e.map(t):[]},hasFeatureData:function(){var e=this.get("feature");return"string"==typeof e&&0!==e.length}})});
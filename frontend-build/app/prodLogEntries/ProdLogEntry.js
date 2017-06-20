// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model","./util/decorateProdLogEntry"],function(e,r){"use strict";return e.extend({urlRoot:"/prodLogEntries",clientUrlRoot:"#prodLogEntries",topicPrefix:"prodLogEntries",privilegePrefix:"PROD_DATA",nlsDomain:"prodLogEntries",defaults:{type:null},serialize:function(){return r(this)}})});
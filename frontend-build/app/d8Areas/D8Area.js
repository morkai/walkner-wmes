// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/d8/areas",clientUrlRoot:"#d8/areas",topicPrefix:"d8.areas",privilegePrefix:"D8:DICTIONARIES",nlsDomain:"d8Areas",labelAttribute:"name",serializeRow:function(){var e=this.toJSON();return e.manager=e.manager?e.manager.label:"",e}})});
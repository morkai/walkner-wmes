// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/settings",clientUrlRoot:"#settings",topicPrefix:"settings",privilegePrefix:"SETTINGS",nlsDomain:"core",defaults:{value:null},getValue:function(){return this.get("value")}})});
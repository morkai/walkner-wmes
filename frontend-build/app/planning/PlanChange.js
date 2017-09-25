// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time","app/core/Model"],function(n,e){"use strict";return e.extend({urlRoot:"/planning/changes",clientUrlRoot:"#planning/changes",topicPrefix:"planning.changes",privilegePrefix:"PLANNING",nlsDomain:"planning",getLabel:function(){return n.utc.format(this.attributes.date,"LL")}})});
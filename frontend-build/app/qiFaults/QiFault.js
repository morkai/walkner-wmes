// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(i){"use strict";return i.extend({urlRoot:"/qi/faults",clientUrlRoot:"#qi/faults",topicPrefix:"qi.faults",privilegePrefix:"QI:DICTIONARIES",nlsDomain:"qiFaults",serialize:function(){var i=this.toJSON();return i.description||(i.description="-"),i}})});
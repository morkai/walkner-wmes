// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../core/Model"],function(i,t){"use strict";return t.extend({urlRoot:"/qi/faults",clientUrlRoot:"#qi/faults",topicPrefix:"qi.faults",privilegePrefix:"QI:DICTIONARIES",nlsDomain:"qiFaults",defaults:{active:!0},serialize:function(){var t=this.toJSON();return t.description||(t.description="-"),t.active=i("qiFaults","active:"+(t.active!==!1)),t}})});
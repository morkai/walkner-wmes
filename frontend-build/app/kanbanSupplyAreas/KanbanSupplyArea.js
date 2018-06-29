// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(e){"use strict";return e.extend({urlRoot:"/kanban/supplyAreas",clientUrlRoot:"#kanban/supplyAreas",topicPrefix:"kanban.supplyAreas",privilegePrefix:"KANBAN",nlsDomain:"kanbanSupplyAreas",serialize:function(){var e=this.toJSON();return e.lines=(e.lines||[]).join("; "),e}})});
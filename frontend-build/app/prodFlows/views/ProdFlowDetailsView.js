// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/DetailsView","./decorateProdFlow","app/prodFlows/templates/details"],function(e,r,s){"use strict";return e.extend({template:s,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render"},serialize:function(){return r(this.model)}})});
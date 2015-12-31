// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/DetailsView","./decorateSubdivision","app/subdivisions/templates/details"],function(e,i,s){"use strict";return e.extend({template:s,localTopics:{"divisions.synced":"render"},serialize:function(){return{model:i(this.model)}}})});
// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/DetailsView","app/prodShiftOrders/templates/details"],function(e,t){"use strict";return e.extend({template:t,remoteTopics:{},serialize:function(){return{model:this.model.serialize({orgUnits:!0,orderUrl:!0})}}})});
// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/View","app/prodShiftOrders/templates/serialNumbers"],function(e,i){"use strict";return e.extend({template:i,remoteTopics:{},serialize:function(){return{idPrefix:this.idPrefix,prodShiftOrderId:this.model.id,serialNumbers:this.collection.toJSON()}}})});
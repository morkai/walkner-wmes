define(["app/core/views/DetailsView","./decorateProdShiftOrder","app/prodShiftOrders/templates/details"],function(e,r,t){return e.extend({template:t,remoteTopics:{},serialize:function(){return{model:r(this.model,{orgUnits:!0,orderUrl:!0})}}})});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/DetailsView","app/prodShiftOrders/templates/details"],function(e,i){return e.extend({template:i,remoteTopics:{},serialize:function(){return{model:this.model.serialize({orgUnits:!0,orderUrl:!0})}}})});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/View","app/purchaseOrders/templates/details"],function(e,i){return e.extend({template:i,className:"pos-details",serialize:function(){return{idPrefix:this.idPrefix,model:this.model.serialize()}}})});
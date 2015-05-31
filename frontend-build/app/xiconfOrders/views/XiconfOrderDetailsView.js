// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/View","app/xiconf/XiconfResultCollection","app/xiconfOrders/templates/details"],function(e,t,n,i,s){"use strict";return n.extend({template:s,initialize:function(){this.xiconfResultCollection=new i},serialize:function(){return{idPrefix:this.idPrefix,programPanelClassName:"panel-"+this.model.getStatusClassName(),linkToResults:this.linkToResults.bind(this),model:this.serializeModel()}},serializeModel:function(){var e=this.model.toJSON();return e.items=e.items.map(function(e){var t=e.quantityDone+e.extraQuantityDone;return e.totalQuantityDone=t,e.panelType="gprs"===e.kind?"default":t<e.quantityTodo?"danger":t>e.quantityTodo?"warning":"success",e}),e},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenTo(this.model,"change",this.render)},linkToResults:function(e,t,n){var i=this.xiconfResultCollection.rqlQuery;return i.sort={startedAt:1},i.selector.args=[],e&&i.selector.args.push({name:"eq",args:["orderNo",e]}),t&&i.selector.args.push({name:"eq",args:["led"===n?"leds.nc12":"nc12",t]}),this.xiconfResultCollection.genClientUrl()+"?"+i}})});
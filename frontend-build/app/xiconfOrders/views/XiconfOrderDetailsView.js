// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/core/View","app/xiconf/XiconfResultCollection","app/xiconfOrders/templates/details"],function(e,t,i,n,s){"use strict";return i.extend({template:s,initialize:function(){this.xiconfResultCollection=new n},serialize:function(){return{idPrefix:this.idPrefix,programPanelClassName:"panel-"+this.model.getStatusClassName(),linkToResults:this.linkToResults.bind(this),model:this.serializeModel()}},serializeModel:function(){var e=this.model.toJSON();return e.items=e.items.map(function(e){var t=e.quantityDone+e.extraQuantityDone;return e.totalQuantityDone=t,e.panelType="gprs"===e.kind?"default":t<e.quantityTodo?"danger":t>e.quantityTodo?"warning":"success",e}),e},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenTo(this.model,"change",this.render)},linkToResults:function(e,t,i){var n=this.xiconfResultCollection.rqlQuery;if(n.sort={startedAt:1},n.selector.args=[],e&&n.selector.args.push({name:"eq",args:["orderNo",e]}),t){var s="led"===i?"leds.nc12":/[A-Z]/.test(t)?"program._id":"nc12";n.selector.args.push({name:"eq",args:[s,t]})}return this.xiconfResultCollection.genClientUrl()+"?"+n}})});
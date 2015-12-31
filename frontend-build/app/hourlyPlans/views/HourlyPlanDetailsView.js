// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/View","app/core/util/onModelDeleted","app/hourlyPlans/templates/entry"],function(e,t,n,i){"use strict";return t.extend({template:i,remoteTopics:function(){var e={};return e["hourlyPlans.updated."+this.model.id]=this.model.handleUpdateMessage.bind(this.model),e["hourlyPlans.deleted"]=this.onModelDeleted.bind(this),e},serialize:function(){return e.extend(this.model.serialize(),{editable:!1})},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelDeleted:function(e){n(this.broker,this.model,e)}})});
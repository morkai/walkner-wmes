// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/View","app/orders/templates/documentList"],function(e,t){"use strict";return e.extend({template:t,serialize:function(){return{documents:this.model.get("documents").toJSON()}},beforeRender:function(){this.stopListening(this.model,"change:documents",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:documents",this.render)}})});
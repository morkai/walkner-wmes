// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/View","app/orders/templates/documentList"],function(e,t){"use strict";return e.extend({template:t,serialize:function(){return{documents:this.model.get("documents").toJSON()}},beforeRender:function(){this.stopListening(this.model,"change:documents",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:documents",this.render)}})});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/View","app/orders/templates/operationList"],function(e,t){function i(e,t){e[t]&&e[t].toLocaleString&&(e[t]=e[t].toLocaleString())}return e.extend({template:t,serialize:function(){return{operations:this.model.get("operations").toJSON().map(function(e){return i(e,"machineSetupTime"),i(e,"laborSetupTime"),i(e,"machineTime"),i(e,"laborTime"),e}).sort(function(e,t){return e.no-t.no}),highlighted:this.options.highlighted}},afterRender:function(){this.listenToOnce(this.model,"change:operations",this.render)}})});
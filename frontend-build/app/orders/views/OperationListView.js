// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/View","app/orders/templates/operationList"],function(e,i,t){"use strict";function n(e,i){e[i]?e[i]=(Math.round(1e3*e[i])/1e3).toLocaleString():e[i]=""}var a={machineSetupTime:"sapMachineSetupTime",laborSetupTime:"sapLaborSetupTime",machineTime:"sapMachineTime",laborTime:"sapLaborTime"};return i.extend({template:t,serialize:function(){var i={};return e.forEach(this.options.summedTimes,function(e,t){i[t]=(Math.round(1e3*e)/1e3).toLocaleString()}),{operations:this.model.get("operations").toJSON().map(function(e){return n(e,"machineSetupTime"),n(e,"laborSetupTime"),n(e,"machineTime"),n(e,"laborTime"),n(e,"sapMachineSetupTime"),n(e,"sapLaborSetupTime"),n(e,"sapMachineTime"),n(e,"sapLaborTime"),e.times={actual:{},sap:{},summed:{}},Object.keys(a).forEach(function(t){var n=a[t];e.times.actual[t]=e[t],e.times.sap[t]=e[n],e.times.summed[t]=i[t]}),e}).sort(function(e,i){return e.no-i.no}),highlighted:this.options.highlighted,timeProps:Object.keys(a)}},beforeRender:function(){this.stopListening(this.model)},afterRender:function(){this.listenToOnce(this.model,"change:operations",this.render)}})});
// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/data/companies","./FteChartView"],function(e,t){"use strict";return t.extend({fteType:"direct",extremesChangeProperties:["maxDirectFte"],serializeChartData:function(){return{direct:this.model.get("totals").direct,byCompany:this.model.get("directByCompany")}},getYAxisMaxValues:function(){return[this.displayOptions.get("maxDirectFte")||null]},createSeries:function(t){var i=[this.createFteSeries("direct",t.direct)];return e.forEach(function(e){i.push(this.createFteSeries(e.id,t.byCompany?t.byCompany[e.id]:null,e.getLabel(),e.get("color")))},this),i}})});
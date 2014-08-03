// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/View","./Report2ClipChartView","./Report2DirIndirChartView","./Report2EffIneffChartView","app/reports/templates/report2Charts"],function(t,i,e,s,r){return t.extend({template:r,initialize:function(){this.setView(".reports-2-clip-container",new i({model:this.model,settings:this.settings,displayOptions:this.displayOptions,skipRenderChart:this.options.skipRenderCharts})),this.setView(".reports-2-dirIndir-container",new e({model:this.model,settings:this.settings,displayOptions:this.displayOptions,skipRenderChart:this.options.skipRenderCharts})),this.setView(".reports-2-effIneff-container",new s({model:this.model,settings:this.settings,displayOptions:this.displayOptions,skipRenderChart:this.options.skipRenderCharts}))},afterRender:function(){this.options.renderCharts!==!1&&this.promised(this.model.fetch());var t=this.model.get("orgUnitType");this.$el.attr("data-orgUnitType",t),this.$el.attr("data-orgUnitId",t?this.model.get("orgUnit").id:void 0)},renderCharts:function(t){this.getViews().forEach(function(t){t.render()}),t&&this.promised(this.model.fetch())},reflowCharts:function(){this.getViews().forEach(function(t){t.chart&&t.chart.reflow()})}})});
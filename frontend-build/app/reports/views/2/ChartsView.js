define(["app/core/View","./ClipChartView","app/reports/templates/2/charts"],function(t,e,i){"use strict";return t.extend({template:i,initialize:function(){this.setView(".reports-2-clip-container",new e({model:this.model,settings:this.settings,displayOptions:this.displayOptions,skipRenderChart:this.options.skipRenderCharts}))},afterRender:function(){this.options.skipRenderCharts||this.promised(this.model.fetch());var t=this.model.get("orgUnitType");this.$el.attr("data-orgUnitType",t),this.$el.attr("data-orgUnitId",t?this.model.get("orgUnit").id:void 0)},renderCharts:function(t){this.getViews().forEach(function(t){t.render()}),t&&this.promised(this.model.fetch())},reflowCharts:function(){this.getViews().forEach(function(t){t.chart&&t.chart.reflow()})}})});
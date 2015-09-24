// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/highcharts","app/i18n","app/core/View","app/data/downtimeReasons","app/data/aors","../util/wordwrapTooltip"],function(t,e,i,s,r,a,o){"use strict";return s.extend({className:function(){return"reports-chart reports-1-"+this.options.attrName},localTopics:function(){var t={};return t[("downtimesByAor"===this.options.attrName?"aors":"downtimeReasons")+".synced"]="render",t},initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:"+this.options.attrName,this.render),this.displayOptions&&(this.listenTo(this.displayOptions,"change:"+this.getSeriesProperty()+" change:"+this.getMaxValueProperty(),t.debounce(this.onDisplayOptionsChange,1)),this.listenTo(this.displayOptions,"change:references",this.onDisplayReferencesChange))},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.isLoading&&this.chart.showLoading()),this.shouldRenderChart=!0},updateChart:function(t){var e=this.serializeChartData(),i=this.chart;this.updateExtremes(),i.xAxis[0].setCategories(e.categories,!1),i.series[0].setData(e.data,!1),i.series[1].setData(e.reference,!1),t!==!1&&i.redraw(!1)},updateExtremes:function(){if(this.$el.hasClass("is-fullscreen"))return void this.chart.yAxis[0].setExtremes(null,null,!0,!1);if(this.displayOptions){var t=!this.model.get("isParent")||"parent"===this.model.get("extremes"),e=t?this.displayOptions.get(this.getMaxValueProperty()):null;this.chart.yAxis[0].setExtremes(null==e?null:0,e,!1,!1)}},serializeChartData:function(){var t={categories:[],data:[],reference:[]},e=this.model.get(this.options.attrName);if(!e||!e.length)return t;var s=this.getCollection(),r=this.$el.hasClass("is-fullscreen")?1/0:10;return e.forEach(function(e){if(this.isValueVisible(e.key)){if(t.categories.length===r&&(t.categories.push("..."),t.data.push({name:i("reports","otherSeries"),y:0,color:"#000"}),t.reference.push({y:null})),t.categories.length>r)return void(t.data[r].y+=e.value);var a=s.get(e.key);t.categories.push(e.shortText),t.data.push({name:o(e.longText),y:e.value,color:a?a.get("color"):"#f00"}),t.reference.push({name:i("reports","referenceValue"),y:a&&this.isReferenceVisible(e.key)?a.get("refValue")||null:null,color:a?a.get("refColor"):"#c00"})}},this),t},isValueVisible:function(t){return!this.displayOptions||this.displayOptions.get(this.getSeriesProperty())[t]},isReferenceVisible:function(t){return!this.displayOptions||this.displayOptions.isReferenceVisible(t)},getCollection:function(){return"downtimesByAor"===this.options.attrName?a:r},getSeriesProperty:function(){return"downtimesByAor"===this.options.attrName?"aors":"reasons"},getMaxValueProperty:function(){return"downtimesByAor"===this.options.attrName?"maxDowntimesByAor":"maxDowntimesByReason"},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onFullscreen:function(t){t?this.chart.setTitle({text:this.model.getOrgUnitTitle()},{text:i("reports",this.options.attrName+":title")},!1):this.chart.setTitle({text:i("reports",this.options.attrName+":title")},{text:null},!1),this.updateChart(!1)},onDisplayOptionsChange:function(){this.updateChart()},onDisplayReferencesChange:function(t,e){var i=Object.keys(e);if(!i.length)return this.updateChart();for(var s=this.getCollection(),r=0,a=i.length;a>r;++r)if(s.get(i[r])){this.updateChart();break}},createChart:function(){var t=this.serializeChartData();this.chart=new e.Chart({chart:{renderTo:this.el},exporting:{filename:i.bound("reports","filenames:1:"+this.options.attrName)},title:{text:i.bound("reports",this.options.attrName+":title")},noData:{},xAxis:{categories:t.categories,showEmpty:!1},yAxis:{title:!1,showEmpty:!1},legend:{enabled:!1},tooltip:{shared:!0,valueSuffix:" FTE",valueDecimals:2},plotOptions:{series:{groupPadding:.1}},series:[{name:i.bound("reports",this.options.attrName+":seriesName"),color:"#f00",type:"column",data:t.data},{name:i.bound("reports","referenceValue"),color:"#c00",type:"column",data:t.reference}]})}})});
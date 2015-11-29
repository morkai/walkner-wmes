// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/highcharts","app/core/View"],function(t,e,i,s){"use strict";return s.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:"+this.options.metric,this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var t=this.serializeSeries(),s=t[0].data.length,r=150+20*t.length*s,o=this.options.metric;this.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1,spacing:[10,1,1,0],height:r,type:"bar"},exporting:{filename:e.bound("kaizenOrders","report:filenames:"+o),chartOptions:{title:{text:e.bound("kaizenOrders","report:title:"+o)}},sourceHeight:r},title:!1,noData:{},xAxis:{categories:this.serializeCategories()},yAxis:{title:!1,min:0,allowDecimals:!1},tooltip:{shared:!0,valueDecimals:0},legend:{enabled:t.length>1},plotOptions:{bar:{dataLabels:{enabled:!0,style:{color:"#000",fontSize:"12px",fontWeight:"bold",textShadow:"0 0 6px #fff, 0 0 3px #fff"}}}},series:t})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeCategories:function(){return this.model.get(this.options.metric).categories},serializeSeries:function(){return this.model.get(this.options.metric).series},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","./Report5FteChartView"],function(i,e,t){"use strict";return t.extend({fteType:"dirIndir",extremesChangeProperties:["maxDirIndirFte","maxDirIndirPercent"],serializeChartData:function(){var i=this.model;return{direct:i.get("totals").direct,indirect:i.get("totals").indirect,dirIndir:i.get("dirIndir")}},getYAxisMaxValues:function(){return[this.displayOptions.get("maxDirIndirFte")||null,this.displayOptions.get("maxDirIndirPercent")||null]},createYAxis:function(){return[{title:!1,min:0},{title:!1,min:0,opposite:!0,labels:{format:"{value}%"}}]},createSeries:function(i){return[this.createFteSeries("direct",i.direct),this.createFteSeries("indirect",i.indirect),{id:"dirIndir",name:e.bound("reports","hr:dirIndir"),color:this.settings.getColor("dirIndir"),type:"line",yAxis:1,data:i.dirIndir,visible:this.displayOptions.isSeriesVisible("dirIndir"),tooltip:{valueSuffix:"%",valueDecimals:1}}]}})});
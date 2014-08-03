// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/companies","app/data/views/renderOrgUnitPath","./Report5FteChartView"],function(t,e,i,r){return r.extend({fteType:"total",extremesChangeProperties:["maxQuantityDone","maxTotalFte"],className:"reports-chart reports-drillingChart reports-5-totals",serializeChartData:function(){return this.model.get("totals")},getChartTitle:function(){var e=this.model.get("orgUnitType");if(!e)return t("reports","charts:title:overall");var r=this.model.get("orgUnit");return"subdivision"===e?i(r,!1,!1):r.getLabel()},updateColor:function(t,e){return r.prototype.updateColor.call(this,"hrTotal"===t?"total":t,e)},getYAxisMaxValues:function(){return[this.displayOptions.get("maxTotalFte")||null,this.displayOptions.get("maxQuantityDone")||null]},createYAxis:function(){return[{title:!1,min:0},{title:!1,min:0,opposite:!0}]},createSeries:function(i){var r=this.displayOptions,a=this.settings,n=[{id:"quantityDone",name:t.bound("reports","hr:quantityDone"),color:a.getColor("quantityDone"),type:"area",yAxis:1,data:i.quantityDone,visible:r.isSeriesVisible("quantityDone"),tooltip:{valueSuffix:" PCS",valueDecimals:0}},this.createFteSeries("total",i.total,null,a.getColor("hrTotal")),this.createFteSeries("direct",i.direct),this.createFteSeries("indirect",i.indirect)];return e.forEach(function(t){n.push(this.createFteSeries(t.id,i.byCompany?i.byCompany[t.id]:null,t.getLabel(),t.get("color")))},this),n}})});
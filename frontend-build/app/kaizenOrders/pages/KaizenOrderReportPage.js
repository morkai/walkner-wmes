// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/View","../dictionaries","../KaizenOrderReport","../views/KaizenOrderReportFilterView","../views/KaizenOrderTableAndChartView","../views/KaizenOrderCountPerUserChartView","app/kaizenOrders/templates/reportPage"],function(e,i,r,t,n,o,d,s){"use strict";return i.extend({layoutName:"page",template:s,breadcrumbs:[e.bound("kaizenOrders","BREADCRUMBS:base"),e.bound("kaizenOrders","BREADCRUMBS:report")],initialize:function(){this.setView(".filter-container",new n({model:this.model})),t.TABLE_AND_CHART_METRICS.forEach(function(e){this.setView(".kaizenOrders-report-"+e,new o({metric:e,model:this.model}))},this),this.setView(".kaizenOrders-report-confirmer",new d({metric:"confirmer",model:this.model})),this.setView(".kaizenOrders-report-owner",new d({metric:"owner",model:this.model})),this.listenTo(this.model,"filtered",this.onFiltered)},destroy:function(){r.unload()},serialize:function(){return{idPrefix:this.idPrefix,metrics:t.TABLE_AND_CHART_METRICS}},load:function(e){return r.loaded?e(this.model.fetch()):r.load().then(this.model.fetch.bind(this.model))},afterRender:function(){r.load()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});
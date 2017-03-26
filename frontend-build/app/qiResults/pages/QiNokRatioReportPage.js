// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/reports/util/formatTooltipHeader","app/data/createSettings","app/factoryLayout/FactoryLayoutSettingCollection","../dictionaries","../QiNokRatioReport","../views/QiNokRatioReportFilterView","../views/QiNokRatioTotalChartView","../views/QiNokRatioDivisionChartView","app/qiResults/templates/nokRatioReportPage"],function(t,e,i,o,a,s,r,n,l,u,c,d,h){"use strict";return i.extend({layoutName:"page",template:h,breadcrumbs:[e.bound("qiResults","BREADCRUMBS:base"),e.bound("qiResults","BREADCRUMBS:reports:nokRatio")],actions:function(){return[{label:e.bound("qiResults","PAGE_ACTION:settings"),icon:"cogs",privileges:"QI:DICTIONARIES:MANAGE",href:"#qi/settings?tab=reports"}]},initialize:function(){var t=o(this.model,this);this.factoryLayoutSettings=s(r),this.setView(".filter-container",new u({model:t})),this.setView("#"+this.idPrefix+"-total",new c({model:t})),this.setView("#"+this.idPrefix+"-division",new d({model:t,factoryLayoutSettings:this.factoryLayoutSettings.acquire()})),this.listenTo(t,"filtered",this.onFiltered)},destroy:function(){n.unload(),this.factoryLayoutSettings.release(),this.factoryLayoutSettings=null},load:function(t){return n.loaded?t(this.model.fetch(),this.factoryLayoutSettings.acquire().fetchIfEmpty()):n.load().then(this.model.fetch.bind(this.model),this.factoryLayoutSettings.acquire().fetchIfEmpty())},afterRender:function(){n.load(),this.factoryLayoutSettings.acquire()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});
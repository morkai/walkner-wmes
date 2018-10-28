define(["underscore","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/reports/util/formatTooltipHeader","app/data/createSettings","app/factoryLayout/FactoryLayoutSettingCollection","../dictionaries","../QiOkRatioReport","../views/QiOkRatioReportFilterView","../views/QiOkRatioChartView","../views/QiOkRatioTableView","app/qiResults/templates/okRatioReportPage"],function(t,e,i,o,a,s,r,n,l,u,c,d,h){"use strict";return i.extend({layoutName:"page",template:h,breadcrumbs:[e.bound("qiResults","BREADCRUMBS:base"),e.bound("qiResults","BREADCRUMBS:reports:okRatio")],actions:function(){return[{label:e.bound("qiResults","PAGE_ACTION:settings"),icon:"cogs",privileges:"QI:DICTIONARIES:MANAGE",href:"#qi/settings?tab=reports"}]},initialize:function(){var t=o(this.model,this);this.factoryLayoutSettings=s(r),this.setView(".filter-container",new u({model:t})),this.setView("#"+this.idPrefix+"-chart",new c({model:t,factoryLayoutSettings:this.factoryLayoutSettings.acquire()})),this.setView("#"+this.idPrefix+"-table",new d({model:t})),this.listenTo(t,"filtered",this.onFiltered)},destroy:function(){n.unload(),this.factoryLayoutSettings.release(),this.factoryLayoutSettings=null},load:function(t){return n.loaded?t(this.model.fetch(),this.factoryLayoutSettings.acquire().fetchIfEmpty()):n.load().then(this.model.fetch.bind(this.model),this.factoryLayoutSettings.acquire().fetchIfEmpty())},afterRender:function(){n.load(),this.factoryLayoutSettings.acquire()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});
define(["app/i18n","app/core/View","../CountReport","../views/CountReportFilterView","../views/CountPerUserChartView","../views/TableAndChartView","../dictionaries","app/wmes-fap-entries/templates/countReportPage"],function(e,t,i,r,n,o,s,a){"use strict";return t.extend({layoutName:"page",template:a,breadcrumbs:function(){return[this.t("BREADCRUMB:base"),this.t("BREADCRUMB:reports:count")]},initialize:function(){this.setView("#-filter",new r({model:this.model})),i.TABLE_AND_CHART_METRICS.forEach(function(e){var t=i.USERS_METRICS[e]?n:o;this.setView("#-"+e,new t({metric:e,model:this.model}))},this),this.listenTo(this.model,"filtered",this.onFiltered)},destroy:function(){s.unload()},load:function(e){return e(s.load(),this.model.fetch())},getTemplateData:function(){return{metrics:i.TABLE_AND_CHART_METRICS}},afterRender:function(){s.load()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});
define(["app/i18n","app/core/View","app/kaizenOrders/dictionaries","../SuggestionEngagementReport","../views/SuggestionEngagementReportFilterView","../views/SuggestionEngagementReportView","app/suggestions/templates/engagementReportPage"],function(e,t,i,n,o,s,r){"use strict";return t.extend({layoutName:"page",pageId:"suggestionEngagementReport",template:r,breadcrumbs:function(){return[e.bound(this.options.baseBreadcrumbNls||"suggestions","BREADCRUMB:base"),e.bound("suggestions","BREADCRUMB:reports:engagement")]},actions:function(){var t=this;return[{label:e.bound("suggestions","engagement:export:action"),icon:"download",callback:function(){var i=this.querySelector(".btn");i.disabled=!0;var n=t.ajax({type:"POST",url:"/reports;download?filename="+e("suggestions","engagement:export:filename"),contentType:"text/csv",data:t.model.serializeToCsv()});n.done(function(e){window.open("/reports;download?key="+e)}),n.always(function(){i.disabled=!1})}}]},initialize:function(){this.defineViews(),this.setView("#"+this.idPrefix+"-filter",this.filterView),this.setView("#"+this.idPrefix+"-report",this.reportView),this.listenTo(this.model,"filtered",this.onFiltered)},defineViews:function(){this.filterView=new o({model:this.model}),this.reportView=new s({model:this.model})},destroy:function(){i.unload()},load:function(e){return i.loaded?e(this.model.fetch()):i.load().then(this.model.fetch.bind(this.model))},afterRender:function(){i.load()},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});
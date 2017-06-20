// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","../Report9","../views/9/TableView","../views/9/ChartView","../views/9/PlanUploadView","app/reports/templates/9/page","app/reports/templates/9/actions"],function(e,t,i,r,o,n,a,s,p,l,c){"use strict";return r.extend({layoutName:"page",pageId:"report9",template:l,breadcrumbs:[e.bound("reports","9:breadcrumbs:base")],remoteTopics:{"cags.plan.synced":function(){i.msg.show({type:"info",time:2500,text:e("reports","9:planUpload:synced")})},"cags.plan.syncFailed":function(){i.msg.show({type:"error",time:5e3,text:e("reports","9:planUpload:syncFailed")})}},actions:function(){var t=this;return[{label:e.bound("reports","9:actions:clearOptions"),icon:"eraser",callback:function(){localStorage.PLU_QUERY="",t.report.clearOptions(),t.updateQuery()}},{label:e.bound("reports","9:actions:export"),icon:"download",callback:function(){var i=this.querySelector(".btn");i.disabled=!0;var r=t.ajax({type:"POST",url:"/reports;download?filename="+e("reports","9:filename:export"),contentType:"text/csv",data:t.report.serializeToCsv()});r.done(function(e){window.location.href="/reports;download?key="+e}),r.always(function(){i.disabled=!1})}},{privileges:"REPORTS:MANAGE",template:c,afterRender:function(t){t.find("a").last().on("click",function(){return document.body.focus(),i.showDialog(new p,e("reports","9:planUpload:title")),!1})}}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#"+this.idPrefix+"-table",this.tableView),this.setView("#"+this.idPrefix+"-chart",this.chartView),this.once("afterRender",function(){this.promised(this.report.fetch())})},defineModels:function(){this.report=o(n.fromQuery(this.resolveQuery()),this)},defineViews:function(){this.tableView=new a({model:this.report}),this.chartView=new s({model:this.report})},defineBindings:function(){this.listenTo(this.report,"change:option",this.updateQuery)},load:function(e){return e()},resolveQuery:function(){var e="",t={};if(this.options.queryString)try{e=atob(this.options.queryString)}catch(e){}return e||(e=localStorage.PLU_QUERY||""),e?(e.split("&").forEach(function(e){var i=e.indexOf("=");if(i!==-1){var r=e.substring(0,i),o=e.substring(i+1);t[r]=o}}),t):t},updateQuery:function(){var e=this.report.serializeQuery();this.broker.publish("router.navigate",{url:this.report.url()+"?"+btoa(e),trigger:!1,replace:!0}),localStorage.PLU_QUERY=e}})});
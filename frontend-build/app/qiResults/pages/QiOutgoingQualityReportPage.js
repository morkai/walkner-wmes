define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/html2pdf","app/data/orgUnits","app/reports/util/formatTooltipHeader","../dictionaries","../QiOutgoingQualityReport","../views/outgoingQuality/FilterView","../views/outgoingQuality/PpmChartView","../views/outgoingQuality/PpmTableView","../views/outgoingQuality/ParetoChartView","../views/outgoingQuality/ParetoTableView","../views/outgoingQuality/ResultListView","app/qiResults/templates/outgoingQuality/page","app/qiResults/templates/outgoingQuality/print"],function(e,t,i,r,s,a,l,n,o,h,p,w,u,d,c,m,g,f,V){"use strict";return s.extend({layoutName:"page",template:f,remoteTopics:{"qi.oqlWeeks.updated":function(e){this.model.updateOqlWeek(e)}},breadcrumbs:function(){return[this.t("BREADCRUMBS:base"),this.t("BREADCRUMBS:reports:outgoingQuality")]},actions:function(){return[{icon:"print",label:this.t("report:oql:printable"),callback:this.print.bind(this)},{label:this.t("PAGE_ACTION:settings"),icon:"cogs",privileges:"QI:DICTIONARIES:MANAGE",href:"#qi/settings?tab=reports"}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-filter",this.filterView),this.setView("#-ppm-chart",this.ppmChartView),this.setView("#-ppm-table",this.ppmTableView),this.setView("#-where-chart",this.whereChartView),this.setView("#-where-table",this.whereTableView),this.setView("#-what-chart",this.whatChartView),this.setView("#-what-table",this.whatTableView),this.setView("#-results",this.resultsListView)},defineModels:function(){a(this.model,this),a(this.model.results,this)},defineViews:function(){var e=this.model;function t(e){var t=n.getByTypeAndId("mrpController",e);return t?t.get("description"):""}function i(e,t){var i=h.faults.get(e);if(!i)return"";var r=i.get("name"),s=i.get("description");return t||r===s?r:r+":\n"+s}this.filterView=new w({model:e}),this.ppmChartView=new u({model:e}),this.ppmTableView=new d({model:e}),this.whereChartView=new c({model:e,property:"where",resolveTitle:t}),this.whereTableView=new m({model:e,property:"where",resolveTitle:t}),this.whatChartView=new c({model:e,property:"what",resolveTitle:i}),this.whatTableView=new m({model:e,property:"what",resolveTitle:i}),this.resultsListView=new g({collection:e.results})},defineBindings:function(){this.listenTo(this.model,"filtered",this.onFiltered)},load:function(e){return e(this.model.fetch())},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})},print:function(){var e=this;r.msg.loading();var s=t.when(e.exportChart(e.ppmChartView.chart,1040,250,{plotOptions:{line:{dataLabels:{enabled:!0}}}}),e.exportChart(e.whereChartView.chart,525,200,{xAxis:[{labels:{formatter:function(){var e=this.chart.series[0].data[this.value];return e?e.name:""}}}]}),e.exportChart(e.whatChartView.chart,525,200,{xAxis:[{labels:{formatter:function(){var e=this.chart.series[0].data[this.value];return e?e.name:""}}}]}));s.always(function(){r.msg.loaded()}),s.fail(function(){r.msg.show({type:"error",time:2500,text:i("core","MSG:EXPORTING_FAILURE")})}),s.done(function(t,i,r){var s={ppm:t[0],where:i[0],what:r[0]},a=e.model.get("week"),n=e.renderPartialHtml(V,{week:a,charts:s,tables:{ppm:e.ppmTableView.serialize().data,where:e.whereTableView.serialize(),what:e.whatTableView.serialize()},results:e.resultsListView.serializeResults()});l(n,{orientation:"landscape",filename:e.t("report:filenames:outgoingQuality",{week:a.replace("-","_")})})})},exportChart:function(t,i,r,s){var a={handleResponse:!1,scale:1,sourceWidth:i,sourceHeight:r,formAttributes:{inline:"1",base64:"1"}};return s=e.assign({title:!1},s),t.exportChart(a,s)}})});
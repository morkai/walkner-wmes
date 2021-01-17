define(["underscore","app/i18n","app/highcharts","app/core/View","app/wmes-osh-reports/templates/table","app/wmes-osh-reports/templates/tableAndChart"],function(t,e,i,s,a,r){"use strict";return s.extend({template:r,initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,`change:${this.options.metric}`,this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading()),this.updateTable()},createChart:function(){const t=this,e=t.serializeSeries(!0);this.chart=new i.Chart({chart:{renderTo:this.$id("chart")[0],plotBorderWidth:1,spacing:[10,1,1,0],type:"column"},exporting:{filename:this.options.filename,chartOptions:{title:{text:this.options.title}},buttons:{contextButton:{align:"left"}}},title:!1,noData:{},xAxis:{categories:t.serializeCategories(!0)},yAxis:{title:!1,min:0,allowDecimals:!1,opposite:!0},tooltip:{shared:!0,valueDecimals:0},legend:{enabled:e.length>1},plotOptions:{column:{dataLabels:{enabled:!0}},series:{events:{legendItemClick:function(){return this.setVisible(!this.visible,!1),t.updateTable(!0),!1}}}},series:e})},updateChart:function(){this.chart.destroy(),this.createChart()},updateTable:function(e){const i=(this.model.get(this.options.totalProperty||"count")||{rows:[]}).rows,s=this.chart,r=this.el.querySelectorAll("svg > rect")[1],o=+r.getAttribute("x");let n=this.serializeCategories(!1),h=this.serializeSeries(!1),l=0,c=!1;t.forEach(h,function(t,e){s.series[e].visible?l+=i[e].abs:c=!0});let d=n.map((e,i)=>{let a=0;return t.forEach(h,(t,e)=>{s.series[e].visible&&(a+=t.data[i])}),{dataIndex:i,no:i+1,label:e,abs:a,rel:a/l}});if(c){(d=d.filter(t=>t.abs>0)).sort((t,e)=>e.abs-t.abs);const e=[],i=h.map(()=>[]);d.forEach((s,a)=>{s.no=a+1,a<15&&(e.push(s.label),t.forEach(i,(t,e)=>{t.push(h[e].data[s.dataIndex])}))}),n=e,h=i}else h=h.map(t=>t.data.slice(0,15));d.push({dataIndex:-1,no:"",label:this.t("series:total"),abs:l,rel:1}),e&&(s.xAxis[0].setCategories(n,!1),h.forEach((t,e)=>{s.series[e].setData(t,!1,!1,!1)}),s.redraw(!1),r.setAttribute("x",o)),this.$id("table").html(this.renderPartialHtml(a,{rows:d}))},serializeCategories:function(t){let{categories:e}=this.model.get(this.options.metric)||{categories:[]};return t&&(e=e.slice(0,15)),e},serializeSeries:function(e){let{series:i}=this.model.get(this.options.metric)||{series:[]};return e&&(i=i.map(function(e){return(e=t.clone(e)).data=e.data.slice(0,15),e})),i},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});
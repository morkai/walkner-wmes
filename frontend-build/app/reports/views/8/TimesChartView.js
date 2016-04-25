// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/highcharts","app/core/View","app/data/colorFactory","app/data/aors","app/reports/util/formatTooltipHeader"],function(e,t,i,r,n,o,l,s){"use strict";return n.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:groups",this.render),this.listenTo(this.model.query,"change:visibleSeries",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var e=this.serializeSeriesAndCategories(),i=e.series,n=e.categories,o=this.serializeYAxis(i),l={filename:t.bound("reports","8:filename:times"),chartOptions:{title:!1,spacing:[0,0,0,0]},sourceWidth:1315.5,sourceHeight:930};n.length&&(l.chartOptions.title={text:this.serializeSingleChartTitle(),style:{fontSize:"24px"}},l.chartOptions.plotOptions={column:{dataLabels:{style:{fontSize:"14px"}}}},l.chartOptions.xAxis=[{type:n.length?"category":"datetime",categories:n.length?n:void 0,labels:{style:{fontSize:"16px"}}}],l.sourceWidth=1315.5,l.sourceHeight=930),this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1,height:450},exporting:l,title:!1,noData:{},xAxis:{type:n.length?"category":"datetime",categories:n.length?n:void 0},yAxis:o,tooltip:{shared:!0,valueDecimals:2,headerFormatter:n.length?void 0:s.bind(this)},legend:{enabled:!n.length,itemStyle:{fontSize:"12px",lineHeight:"14px"}},plotOptions:{column:{dataLabels:{enabled:!!n.length,formatter:function(){return 0===this.y?"":r.numberFormat(this.y,1).replace(/.0$/,"")},style:{color:"#000",fontSize:"12px",fontWeight:"normal",textShadow:"none"}}}},series:i})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeYAxis:function(t){var i=[],r={},n={percent:{id:"percent",title:!1,min:0,decimals:2,opposite:!1,labels:{format:"{value}%"}},pce:{id:"pce",title:!1,min:0,decimals:0,opposite:!1},time:{id:"time",title:!1,min:0,decimals:2,opposite:!1}},o=-1;return e.forEach(t,function(e){void 0===r[e.yAxis]&&(r[e.yAxis]=++o)}),e.forEach(r,function(e,t){i.push(n[t])}),i.length>1&&e.forEach(i,function(e){e.opposite="time"!==e.id}),i},serializeSeriesAndCategories:function(){function i(e,i,n,o){s&&(i.data=s[e][n],i.data&&(i.id=n+":"+e,r.query.isVisibleSeries(i.id)&&(i.metricId=n,i.planReal=e,i.metricLabel=o?l.get(n).getLabel():t("reports","8:times:"+n),i.name=i.metricLabel+" "+t("reports","8:suffix:"+e),i.color=r.getColor("times",i.id),i.groupPadding=a?0:.2,h[i.yAxis]=!0,c.push(i))))}var r=this.model,n=t("reports","8:times:unit:"+r.query.get("unit")),o=r.get("summary"),s=r.get("groups"),a=s&&1===s.plan.totalVolumeProduced.length,h={},c=[],d={timeAvailablePerShift:null,routingTimeForLine:null,routingTimeForLabour:null,heijunkaTimeForLine:null,breaks:null,fap0:null,startup:null,shutdown:null,meetings:null,sixS:null,tpm:null,trainings:null,coTime:null,downtime:null,plan:{type:a?"column":"line",yAxis:"pce",zIndex:3,tooltip:{valueSuffix:t("reports","quantitySuffix")}},efficiency:{type:a?"column":"line",yAxis:"percent",zIndex:3,tooltip:{valueSuffix:"%"}}};return e.forEach(o?o.downtimeByAor:null,function(e,t){d[t]=null}),e.forEach(d,function(t,r){null===t&&(t={type:"column",yAxis:"time",tooltip:{valueSuffix:n}});var o=/^[a-f0-9]{24}$/.test(r);o||i("plan",e.clone(t),r),i("real",e.clone(t),r,o)}),h=Object.keys(h),a&&1===h.length&&c.length?this.serializeSingleSeriesAndCategories(c,h[0]):{categories:[],series:c}},serializeSingleSeriesAndCategories:function(i,r){var n={},o=[{id:"plan",type:"column",name:t("reports","8:column:plan"),yAxis:r,data:[],tooltip:i[0].tooltip,grouping:!1,borderWidth:0,groupPadding:0,color:"rgba(0, 170, 255, 0.5)"},{id:"real",type:"column",name:t("reports","8:column:real"),yAxis:r,data:[],tooltip:i[0].tooltip,grouping:!1,borderWidth:0,color:"rgba(0, 170, 255, 1)"}];return e.forEach(i,function(e){n[e.metricId]||(n[e.metricId]={label:e.metricLabel,plan:null,real:null}),n[e.metricId][e.planReal]=e.data[0].y}),e.forEach(n,function(e){var t=e.plan<e.real;o[0].data.push({y:e.plan,dataLabels:{inside:t}}),o[1].data.push({y:e.real,dataLabels:{inside:!t,style:{fontStyle:"oblique"}},color:null===e.plan?void 0:t?"#d9534f":"#5cb85c"})}),{categories:e.map(n,function(e){return e.label}),series:o}},serializeSingleChartTitle:function(){var e=this.model,i=e.query,r=i.get("shifts"),n=i.get("divisions"),o=i.get("subdivisionTypes"),l=i.get("prodLines"),a=e.get("groups").plan.totalVolumeProduced,h=[];return l.length?h.push(t("reports","8:title:line"+(1===l.length?"":"s"),{line:l.join(", ")})):i.hasAllDivisionsSelected()?1===o.length?h.push(t("reports","filter:subdivisionType:"+o[0])):h.push(t("reports","charts:title:overall")):(h.push(n.join(", ")),1===o.length&&h.push(t("reports","filter:subdivisionType:"+o[0]))),a.length&&h.push(s.call(this,a[0].x)),h.push(t("reports","8:title:shift:"+(r.length||3),{s1:t("core","SHIFT:"+r[0]),s2:t("core","SHIFT:"+r[1]),s3:t("core","SHIFT:"+r[2])})),h.join(" - ")},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});
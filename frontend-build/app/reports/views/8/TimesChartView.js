// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/time","app/highcharts","app/core/View","app/data/colorFactory","app/data/aors","app/reports/util/formatTooltipHeader"],function(e,t,i,r,n,a,o,l){"use strict";return n.extend({initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:groups",this.render),this.listenTo(this.model.query,"change:visibleSeries",this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var e=this.serializeSeriesAndCategories(),i=e.series,n=e.categories,a=this.serializeYAxis(i);this.chart=new r.Chart({chart:{renderTo:this.el,plotBorderWidth:1,height:450},exporting:{filename:t.bound("reports","8:filename:times"),chartOptions:{title:!1,spacing:[0,0,0,0]},sourceWidth:1315.5,sourceHeight:930},title:!1,noData:{},xAxis:{type:n.length?"category":"datetime",categories:n.length?n:void 0},yAxis:a,tooltip:{shared:!0,valueDecimals:2,headerFormatter:n.length?void 0:l.bind(this)},legend:{enabled:!n.length,itemStyle:{fontSize:"12px",lineHeight:"14px"}},plotOptions:{column:{dataLabels:{enabled:!!n.length,formatter:function(){return 0===this.y?"":r.numberFormat(this.y,1).replace(/.0$/,"")},style:{color:"#000",fontSize:"12px",fontWeight:"normal",textShadow:"none"}}}},series:i})},updateChart:function(){this.chart.destroy(),this.createChart()},serializeYAxis:function(t){var i=[],r={},n={percent:{id:"percent",title:!1,min:0,decimals:2,opposite:!1,labels:{format:"{value}%"}},pce:{id:"pce",title:!1,min:0,decimals:0,opposite:!1},time:{id:"time",title:!1,min:0,decimals:2,opposite:!1}},a=-1;return e.forEach(t,function(e){void 0===r[e.yAxis]&&(r[e.yAxis]=++a)}),e.forEach(r,function(e,t){i.push(n[t])}),i.length>1&&e.forEach(i,function(e){e.opposite="time"!==e.id}),i},serializeSeriesAndCategories:function(){function i(e,i,n,a){l&&(i.data=l[e][n],i.data&&(i.id=n+":"+e,r.query.isVisibleSeries(i.id)&&(i.metricId=n,i.planReal=e,i.metricLabel=a?o.get(n).getLabel():t("reports","8:times:"+n),i.name=i.metricLabel+" "+t("reports","8:suffix:"+e),i.color=r.getColor("times",i.id),i.groupPadding=s?0:.2,h[i.yAxis]=!0,d.push(i))))}var r=this.model,n=t("reports","8:times:unit:"+r.query.get("unit")),a=r.get("summary"),l=r.get("groups"),s=l&&1===l.plan.totalVolumeProduced.length,h={},d=[],c={timeAvailablePerShift:null,routingTimeForLine:null,routingTimeForLabour:null,heijunkaTimeForLine:null,breaks:null,fap0:null,startup:null,shutdown:null,meetings:null,sixS:null,tpm:null,trainings:null,coTime:null,downtime:null,plan:{type:s?"column":"line",yAxis:"pce",zIndex:3,tooltip:{valueSuffix:t("reports","quantitySuffix")}},efficiency:{type:s?"column":"line",yAxis:"percent",zIndex:3,tooltip:{valueSuffix:"%"}}};return e.forEach(a?a.downtimeByAor:null,function(e,t){c[t]=null}),e.forEach(c,function(t,r){null===t&&(t={type:"column",yAxis:"time",tooltip:{valueSuffix:n}});var a=/^[a-f0-9]{24}$/.test(r);a||i("plan",e.clone(t),r),i("real",e.clone(t),r,a)}),h=Object.keys(h),s&&1===h.length&&d.length?this.serializeSingleSeriesAndCategories(d,h[0]):{categories:[],series:d}},serializeSingleSeriesAndCategories:function(i,r){var n={},a=[{id:"plan",type:"column",name:t("reports","8:column:plan"),yAxis:r,data:[],tooltip:i[0].tooltip,grouping:!1,borderWidth:0,groupPadding:0,color:"rgba(0, 170, 255, 0.5)"},{id:"real",type:"column",name:t("reports","8:column:real"),yAxis:r,data:[],tooltip:i[0].tooltip,grouping:!1,borderWidth:0,color:"rgba(0, 170, 255, 1)"}];e.forEach(i,function(e){n[e.metricId]||(n[e.metricId]={label:e.metricLabel,plan:null,real:null}),n[e.metricId][e.planReal]=e.data[0].y}),e.forEach(n,function(e){var t=e.plan<e.real;a[0].data.push({y:e.plan,dataLabels:{inside:t}}),a[1].data.push({y:e.real,dataLabels:{inside:!t,style:{fontWeight:"bold"}},color:null===e.plan?void 0:t?"#d9534f":"#5cb85c"})});var o={categories:e.map(n,function(e){return e.label}),series:a};return o},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});
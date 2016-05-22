// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/highcharts","app/core/View","app/suggestions/templates/reportTable","app/suggestions/templates/tableAndChart"],function(t,e,i,s,a,r){"use strict";return s.extend({template:r,initialize:function(){this.chart=null,this.isLoading=!1,this.limit=-1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:"+this.options.metric,this.render)},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdate&&clearTimeout(this.timers.createOrUpdate),this.timers.createOrUpdate=setTimeout(this.createOrUpdate.bind(this),1)},createOrUpdate:function(){this.timers.createOrUpdate=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading()),this.updateTable()},createChart:function(){var t=this,s=t.serializeSeries(),a=s[0].data.length,r=t.model.getNlsDomain(),n=t.options.metric,o=-1===t.limit,l=o?void 0:100+20*a;this.chart=new i.Chart({chart:{renderTo:this.$id("chart")[0],plotBorderWidth:1,spacing:o?[10,1,1,0]:[10,10,15,10],height:l,type:o?t.options.unlimitedType:"bar"},exporting:{filename:e.bound(r,"report:filenames:summary:"+n),chartOptions:{title:{text:e.bound(r,"report:title:summary:"+n)}},buttons:{contextButton:{align:"left"}},sourceHeight:l},title:!1,noData:{},xAxis:{categories:t.serializeCategories()},yAxis:{title:!1,min:0,allowDecimals:!1,opposite:o},tooltip:{shared:!0,valueDecimals:0},legend:{enabled:o},plotOptions:{bar:{stacking:"normal",dataLabels:{enabled:!o,formatter:function(){return this.y||""}}},column:{stacking:"normal",dataLabels:{enabled:o,formatter:function(){return this.y||""}}},series:{events:{legendItemClick:function(){return this.setVisible(!this.visible,!1),t.updateTable(!0),!1}}}},series:s})},updateChart:function(){this.chart.destroy(),this.createChart()},updateTable:function(e){if(-1!==this.limit)return void this.$id("table").empty();var i=this.model.get("total").count,s=this.serializeCategories(!1),r=this.serializeSeries(!1),n=this.chart,o=0,l=!1,h=this.el.querySelectorAll("svg > rect")[1],c=+h.getAttribute("x");t.forEach(r,function(t,e){n.series[e].visible?o+=i[t.id]:l=!0});var d=s.map(function(e,i){var s=0;return t.forEach(r,function(t,e){n.series[e].visible&&(s+=t.data[i])}),{dataIndex:i,no:i+1,label:e,abs:s,rel:s/o}});if(l){d=d.filter(function(t){return t.abs>0}),d.sort(function(t,e){return e.abs-t.abs});var u=[],p=r.map(function(){return[]});d.forEach(function(e,i){e.no=i+1,15>i&&(u.push(e.label),t.forEach(p,function(t,i){t.push(r[i].data[e.dataIndex])}))}),s=u,r=p}else r=r.map(function(t){return t.data.slice(0,15)});e&&(n.xAxis[0].setCategories(s,!1),r.forEach(function(t,e){n.series[e].setData(t,!1,!1,!1)}),n.redraw(!1),h.setAttribute("x",c)),this.$id("table").html(a({rows:d}))},serializeCategories:function(t){var e=this.model.get(this.options.metric).categories;return t!==!1&&-1!==this.limit&&(e=e.slice(0,this.limit)),e},serializeSeries:function(t){var i=this.model.get(this.options.metric),s=this.limit,a=this.options.top;return t!==!1&&(s>0?i={cancelled:i.cancelled.slice(0,s),open:i.open.slice(0,s),finished:i.finished.slice(0,s)}:a>0&&(i={cancelled:i.cancelled.slice(0,a),open:i.open.slice(0,a),finished:i.finished.slice(0,a)})),[{id:"cancelled",name:e.bound("suggestions","report:series:summary:cancelled"),data:i.cancelled,color:"#d9534f"},{id:"open",name:e.bound("suggestions","report:series:summary:open"),data:i.open,color:"#f0ad4e"},{id:"finished",name:e.bound("suggestions","report:series:summary:finished"),data:i.finished,color:"#5cb85c"}]},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()}})});
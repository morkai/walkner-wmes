define(["app/time","app/highcharts","app/core/View","app/core/util/median","app/prodShiftOrders/templates/serialNumbers"],function(t,e,a,i,r){"use strict";return a.extend({template:r,remoteTopics:{},destroy:function(){this.chart&&(this.chart.destroy(),this.chart=null)},getTemplateData:function(){return{prodShiftOrderId:this.model.id,serialNumbers:this.collection.toJSON()}},afterRender:function(){this.collection.length&&this.renderChart()},renderChart:function(){var a=[],r=[],s=[],o=this.collection.at(0).get("sapTaktTime"),n=2*o,l=this.model.getActualTaktTime(),h=Number.MAX_SAFE_INTEGER,c=Number.MIN_SAFE_INTEGER,d=[];this.collection.forEach(function(e,i){var l="#"+e.get("serialNo")+" @ "+t.format(e.get("scannedAt"),"L LTS"),u=e.get("taktTime")/1e3;h=Math.min(h,u),c=Math.max(c,u),d.push(u),a.push((i+1).toString()),r.push({name:l,y:u,color:u>n?"#000":u>o?"#d9534f":"#5cb85c",percent:Math.round(u/o*100)}),s.push({name:l,y:o,percent:100})}),h=h<1?1:Math.round(h),c=c<1?1:Math.round(c),d=(d=i(d,!1))<1?1:Math.round(d),this.$id("totals").html(this.t("serialNumbers:panel:totals",{tgt:o+"s ▪ 100%",avg:l+"s ▪ "+Math.round(l/o*100)+"%",med:d+"s ▪ "+Math.round(d/o*100)+"%",min:h+"s ▪ "+Math.round(h/o*100)+"%",max:c+"s ▪ "+Math.round(c/o*100)+"%"})),this.chart=new e.Chart({chart:{renderTo:this.$id("chart")[0],plotBorderWidth:0,spacing:[15,15,0,15],type:"column"},exporting:{filename:this.t("serialNumbers:chart:filename"),chartOptions:{title:{text:this.t("serialNumbers:chart:title")}}},title:!1,noData:{},xAxis:{categories:a},yAxis:[{title:!1,min:0,max:n,allowDecimals:!1,opposite:!1}],tooltip:{shared:!0,valueDecimals:0,extraRowsProvider:function(t,e){e.forEach(function(t){t.extraColumns='<td class="highcharts-tooltip-integer">'+t.point.options.percent+'</td><td class="highcharts-tooltip-suffix">%</td>'})}},legend:{enabled:!0},plotOptions:{column:{dataLabels:{enabled:!1}},line:{marker:{enabled:!1}}},series:[{id:"actual",type:"column",name:this.t("serialNumbers:metrics:actual"),data:r,tooltip:{valueSuffix:"s"}},{id:"target",type:"line",color:"orange",name:this.t("serialNumbers:metrics:target"),data:s,tooltip:{valueSuffix:"s"}}]})}})});
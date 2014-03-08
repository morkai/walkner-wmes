define(["underscore","app/time","app/i18n","app/core/View","app/data/orgUnits","app/data/views/renderOrgUnitPath","app/highcharts"],function(t,e,i,r,s,o,n){return r.extend({className:function(){return"reports-chart reports-drillingChart reports-1-coeffs"},initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:coeffs",this.render),this.metricRefs&&(this.listenTo(this.metricRefs,"add",this.onMetricRefUpdate),this.listenTo(this.metricRefs,"change",this.onMetricRefUpdate))},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.loading&&this.chart.showLoading()),this.shouldRenderChart=!0},createChart:function(){var t=this.serializeChartData(),e=this.formatTooltipHeader.bind(this),r=this.getMarkerStyles(t.quantityDone.length),s=this;this.chart=new n.Chart({chart:{renderTo:this.el,zoomType:"x",resetZoomButton:{relativeTo:"chart",position:{y:5}},events:{selection:function(t){t.resetSelection&&(s.timers.resetExtremes=setTimeout(this.yAxis[1].setExtremes.bind(this.yAxis[1],0,null,!0,!1),1))}}},title:{useHTML:!0,text:this.getTitle()},noData:{},xAxis:{type:"datetime"},yAxis:[{title:!1},{title:!1,opposite:!0,gridLineWidth:0,labels:{format:"{value}%"}}],tooltip:{shared:!0,useHTML:!0,formatter:function(){var t="<b>"+e(this.x)+"</b><table>";return $.each(this.points,function(e,i){t+='<tr><td style="color: '+i.series.color+'">'+i.series.name+":</td><td>"+i.y+i.series.tooltipOptions.valueSuffix+"</td></tr>"}),t+="</table>"}},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{area:{lineWidth:0,marker:r},line:{lineWidth:2,states:{hover:{lineWidth:2}},marker:r}},series:[{name:i("reports","coeffs:quantityDone"),color:"#00aaff",type:"area",yAxis:0,data:t.quantityDone,tooltip:{valueSuffix:i("reports","quantitySuffix")}},{name:i("reports","coeffs:efficiency"),color:"#00ee00",type:"line",yAxis:1,data:t.efficiency,tooltip:{valueSuffix:"%"},events:{show:this.updateEfficiencyRef.bind(this),hide:this.updateEfficiencyRef.bind(this)}},{name:i("reports","coeffs:productivity"),color:"#ffaa00",type:"line",yAxis:1,data:t.productivity,tooltip:{valueSuffix:"%"},visible:"hour"!==this.model.query.get("interval"),events:{show:this.updateProductivityRef.bind(this),hide:this.updateProductivityRef.bind(this)}},{name:i("reports","coeffs:downtime"),color:"rgba(255, 0, 0, .75)",borderColor:"#AC2925",borderWidth:0,type:"column",yAxis:1,data:t.downtime,tooltip:{valueSuffix:"%"}}]})},updateChart:function(){var t=this.serializeChartData(),e=0;t.quantityDone.length||(e=null),this.chart.yAxis[1].setExtremes(e,null,!1);var i="hour"!==this.model.query.get("interval"),r=this.getMarkerStyles(t.quantityDone.length);this.chart.series[0].update({marker:r},!1),this.chart.series[1].update({marker:r},!1),this.chart.series[2].update({marker:r,visible:i},!1),this.chart.series[3].update({marker:r},!1),this.chart.series[0].setData(t.quantityDone,!1),this.chart.series[1].setData(t.efficiency,!1),this.chart.series[2].setData(t.productivity,!1),this.chart.series[3].setData(t.downtime,!0),this.updatePlotLines()},updatePlotLines:function(){this.metricRefs&&(this.updateEfficiencyRef(),this.updateProductivityRef())},updatePlotLine:function(t,e,i,r,s){if(e.removePlotLine(t),i.visible){var o=this.getMetricRef(t);o&&e.addPlotLine({id:t,color:r,dashStyle:s,value:o,width:2,zIndex:4})}},updateEfficiencyRef:function(){this.chart&&this.updatePlotLine("efficiency",this.chart.yAxis[1],this.chart.series[1],"#00ee00","dash")},updateProductivityRef:function(){this.chart&&this.updatePlotLine("productivity",this.chart.yAxis[1],this.chart.series[2],"#ffaa00","dash")},getMetricRef:function(t){return this.metricRefs.getValue(t,this.getMetricRefOrgUnitId())},getMetricRefOrgUnitId:function(){var t=this.model.get("orgUnitType"),e=this.model.get("orgUnit"),i=this.model.query.get("subdivisionType");if(null===t)return"overall"+(i?"."+i:"");if("division"===t)return this.getMetricRefOrgUnitIdByDivision(i,e);if("subdivision"===t)return e.id;var r=s.getSubdivisionFor(e);return r?r.id:null},getMetricRefOrgUnitIdByDivision:function(t,e){if(null===t)return e.id;"prod"===t&&(t="assembly");var i=s.getChildren(e).filter(function(e){return e.get("type")===t});return i.length?i[0].id:null},serializeChartData:function(){return this.model.get("coeffs")},formatTooltipHeader:function(t){var r,s=e.getMoment(t),o=this.model.query.get("interval")||"hour";return"shift"===o&&(r={shift:i("core","SHIFT:"+(6===s.hours()?1:14===s.hours()?2:3))}),s.format(i("reports","tooltipHeaderFormat:"+o,r))},getMarkerStyles:function(t){return{radius:t>1?0:3,states:{hover:{radius:t>1?3:6}}}},getTitle:function(){var t=this.model.get("orgUnitType");if(!t)return i("reports","charts:title:overall");var e=this.model.get("orgUnit");return"subdivision"===t?o(e,!1,!1):e.getLabel()},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onMetricRefUpdate:function(t){var e=this.metricRefs.parseSettingId(t.id);("efficiency"===e.metric||"productivity"===e.metric)&&e.orgUnit===this.getMetricRefOrgUnitId()&&("efficiency"===e.metric?this.updateEfficiencyRef():this.updateProductivityRef())}})});
define(["screenfull","app/highcharts","app/i18n","app/core/View","app/data/categoryFactory","./wordwrapTooltip"],function(e,t,r,n,a,i){return n.extend({className:function(){return"reports-chart reports-2-effIneff"},events:{dblclick:function(){e.enabled&&e.request(this.el)}},initialize:function(){this.shouldRenderChart=!this.options.skipRenderChart,this.chart=null,this.loading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:effIneff",this.render),this.onFullscreenChange=this.onFullscreenChange.bind(this),this.el.ownerDocument.addEventListener(e.raw.fullscreenchange,this.onFullscreenChange)},destroy:function(){this.el.ownerDocument.removeEventListener(e.raw.fullscreenchange,this.onFullscreenChange),null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.chart?this.updateChart():this.shouldRenderChart&&(this.createChart(),this.loading&&this.chart.showLoading()),this.shouldRenderChart=!0},onFullscreenChange:function(e){e.target===this.el&&this.updateChart()},createChart:function(){this.chart=new t.Chart({chart:{renderTo:this.el},title:{text:r("reports","effIneff:title"),style:{fontSize:"12px",color:"#4D759E"}},noData:{},tooltip:{borderColor:"#999999"},xAxis:{categories:[]},yAxis:{title:!1},legend:!1,series:[{name:r("reports","effIneff:seriesName"),type:"column",data:[],dataLabels:{enabled:!0}}]})},updateChart:function(){var e=this.serializeChartData();this.chart.xAxis[0].setCategories(e.categories,!1),this.chart.series[0].setData(e.data,!0)},serializeChartData:function(){var t=e.isFullscreen,n=this.model.get("tasks"),s=this.model.get("effIneff"),o=[],h=[];if(0===s.value&&0===s.dirIndir)return{categories:o,data:h};h.push({category:r("reports","effIneff:category:value"),name:r("reports","effIneff:name:value"),y:Math.abs(s.value),color:s>0?"#00ee00":"#ee0000"},{category:r("reports","effIneff:category:dirIndir"),name:r("reports","effIneff:name:dirIndir"),y:s.dirIndir,color:"#eeee00"}),Object.keys(s.prodTasks).forEach(function(e){h.push({category:a.getCategory("tasks",e),name:i(n[e]||e),y:s.prodTasks[e],color:"#eeee00"})}),h.sort(function(e,t){return t.y-e.y}).forEach(function(e){o.push(e.category)});var l=o.length,c=10;if(!t&&l>c){for(var f=o.slice(0,c-1),d=h.slice(0,c-1),u=0,g=c;l>g;++g)u+=h[g].y;f.push(r("reports","effIneff:category:other")),d.push({name:r("reports","effIneff:name:other"),y:Math.round(10*u)/10,color:"#000"}),o=f,h=d}if(t)for(var p=0;l>p;++p)o[p]=h[p].name;return{categories:o,data:h}},onModelLoading:function(){this.loading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.loading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.loading=!1,this.chart&&this.chart.hideLoading()}})});
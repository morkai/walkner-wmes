// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/time","app/core/View","app/highcharts"],function(t,e,o,i){"use strict";function r(t){return t.toLocaleString().replace(/\s+/g,"")}return o.extend({className:"reports-7-inout",localTopics:{"i18n.reloaded":"cacheI18n"},initialize:function(){this.chart=null,this.isLoading=!1,this.listenTo(this.model,"request",this.onModelLoading),this.listenTo(this.model,"sync",this.onModelLoaded),this.listenTo(this.model,"error",this.onModelError),this.listenTo(this.model,"change:"+this.options.type,this.render),this.cacheI18n()},destroy:function(){null!==this.chart&&(this.chart.destroy(),this.chart=null)},afterRender:function(){this.timers.createOrUpdateChart&&clearTimeout(this.timers.createOrUpdateChart),this.timers.createOrUpdateChart=setTimeout(this.createOrUpdateChart.bind(this),1)},cacheI18n:function(){this.i18n={hourSuffix:t("reports","7:valueSuffix:hour"),manHourSuffix:t("reports","7:valueSuffix:manHour"),decimalPoint:t("core","highcharts:decimalPoint")}},createOrUpdateChart:function(){this.timers.createOrUpdateChart=null,this.chart?this.updateChart():(this.createChart(),this.isLoading&&this.chart.showLoading())},createChart:function(){var e=this.serializeChartData(),o=this.options,r="downtimeTimes"===o.type?this.i18n.hourSuffix:"",a="downtimeTimes"===o.type?2:0,s=e.indoor.length<=12;this.chart=new i.Chart({chart:{renderTo:this.el,plotBorderWidth:1},exporting:{filename:t.bound("reports","filenames:7:inout:"+o.type)},title:{text:t.bound("reports","7:title:"+o.type)},noData:{},xAxis:{type:"datetime"},yAxis:{title:!1,labels:{format:"{value}"+r},min:0},tooltip:{shared:!0,valueSuffix:r,valueDecimals:a,headerFormatter:this.formatTooltipHeader.bind(this),extraRowsProvider:this.provideExtraTooltipRows.bind(this)},legend:{layout:"horizontal",align:"center",verticalAlign:"bottom"},plotOptions:{column:{borderWidth:0,dataLabels:{enabled:!0,color:"#000"}}},series:[{id:"indoor",name:this.getSeriesName({id:"indoor",group:"indoor"}),type:"column",data:e.indoor,color:"#00aaff",group:"indoor",dataLabels:{enabled:s}},{id:"specificIndoor",name:this.getSeriesName({id:"specificIndoor",group:"indoor"}),type:"column",data:e.specificIndoor,color:"#0066bb",group:"indoor",dataLabels:{enabled:s}},{id:"outdoor",name:this.getSeriesName({id:"outdoor",group:"outdoor"}),type:"column",data:e.outdoor,color:"#00ee00",group:"outdoor",dataLabels:{enabled:s}},{id:"specificOutdoor",name:this.getSeriesName({id:"specificOutdoor",group:"outdoor"}),type:"column",data:e.specificOutdoor,color:"#00aa00",group:"outdoor",dataLabels:{enabled:s}}]})},updateChart:function(){for(var t=this.serializeChartData(),e=this.chart.series,o=0;o<e.length;++o){var i=e[o],r=i.options,a=t[r.id];r.name=this.getSeriesName(i.options),r.dataLabels.enabled=a.length<=12,i.setData(a,!1),i.update(r,!1)}this.chart.redraw(!1)},serializeChartData:function(){return this.model.get(this.options.type)},onModelLoading:function(){this.isLoading=!0,this.chart&&this.chart.showLoading()},onModelLoaded:function(){this.interval=null,this.isLoading=!1,this.chart&&this.chart.hideLoading()},onModelError:function(){this.isLoading=!1,this.chart&&this.chart.hideLoading()},formatTooltipHeader:function(o){var i,r=e.getMoment("number"==typeof o?o:o.x);return this.interval||(this.interval=this.model.query.getDowntimesChartInterval()),"quarter"===this.interval&&(i={quarter:t("core","QUARTER:"+r.quarter())}),r.format(t("reports","tooltipHeaderFormat:"+this.interval,i))},getSeriesName:function(e){var o=/^specific/.test(e.id),i=o?this.model.getSpecificAor():this.model.getSingleAor();return i?t("reports","7:series:"+e.group+":aor",{aor:i.getLabel()}):t("reports","7:series:"+e.group+(o?":specific":""))},provideExtraTooltipRows:function(e,o){for(var i=this,r="downtimeTimes"===this.options.type,a=0,s=0,n=0,d=0,h=0;h<e.length;++h){var l=e[h],u=l.point.workerCount||0;/indoor$/i.test(l.series.options.id)?(a+=l.y,s+=l.y*u):(n+=l.y,d+=l.y*u),o[h].extraColumns=r?i.createManHourTooltipColumns(l.y,u):""}var c=r?this.i18n.hourSuffix:"",p=r?2:0,m=a+n,f=s+d;o.push({color:"#000",name:t("reports","7:series:indoor:total"),suffix:c,decimals:p,value:a,extraColumns:r?this.createManHourTooltipColumns(s):""},{color:"#000",name:t("reports","7:series:outdoor:total"),suffix:c,decimals:p,value:n,extraColumns:r?this.createManHourTooltipColumns(d):""},{color:"#000",name:t("reports","7:series:total"),suffix:c,decimals:p,value:m,extraColumns:r?this.createManHourTooltipColumns(f):""})},createManHourTooltipColumns:function(t,e){var o=t*(e||1),r=this.i18n.decimalPoint,a=i.numberFormat(o,2).split(r);return'<td class="highcharts-tooltip-integer">'+a[0]+'</td><td class="highcharts-tooltip-fraction">'+(2===a.length?r+a[1]:"")+'</td><td class="highcharts-tooltip-suffix">'+this.i18n.manHourSuffix+"</td>"},serializeToCsv:function(){var t=["date;readableDate;indoor;specificIndoor;outdoor;specificOutdoor"],o=this.chart.series,i=o[0].data,a="downtimeTimes"===this.options.type;a&&(t[0]+=";indoorWorkers;specificIndoorWorkers;outdoorWorkers;specificOutdoorWorkers");for(var s=0;s<i.length;++s){var n=e.format(i[s].x,"YYYY-MM-DD")+';"'+this.formatTooltipHeader(i[s].x)+'";'+r(o[0].data[s].y)+";"+r(o[1].data[s].y)+";"+r(o[2].data[s].y)+";"+r(o[3].data[s].y);a&&(n+=";"+o[0].data[s].workerCount+";"+o[1].data[s].workerCount+";"+o[2].data[s].workerCount+";"+o[3].data[s].workerCount),t.push(n)}return t.join("\r\n")}})});
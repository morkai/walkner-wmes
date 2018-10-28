define(["underscore","highcharts","highcharts.exporting","highcharts.no-data-to-display","highcharts.grouped-categories","./i18n","./time","./broker","i18n!app/nls/core"],function(t,o,e,r,i,a,s,n){"use strict";e(o),r(o),i(o);var h=o.Tooltip.prototype.getPosition;function l(){o.setOptions({lang:{contextButtonTitle:a("core","highcharts:contextButtonTitle"),downloadJPEG:a("core","highcharts:downloadJPEG"),downloadPDF:a("core","highcharts:downloadPDF"),downloadPNG:a("core","highcharts:downloadPNG"),downloadSVG:a("core","highcharts:downloadSVG"),printChart:a("core","highcharts:printChart"),noData:a("core","highcharts:noData"),resetZoom:a("core","highcharts:resetZoom"),resetZoomTitle:a("core","highcharts:resetZoomTitle"),loading:a("core","highcharts:loading"),decimalPoint:a("core","highcharts:decimalPoint"),thousandsSep:a("core","highcharts:thousandsSep"),shortMonths:a("core","highcharts:shortMonths").split("_"),weekdays:a("core","highcharts:weekdays").split("_"),months:a("core","highcharts:months").split("_")},exporting:{buttons:{contextButton:{menuItems:c()}}}})}function c(){return[{text:a("core","highcharts:downloadPDF"),onclick:t.partial(p,"application/pdf")},{text:a("core","highcharts:downloadPNG"),onclick:t.partial(p,"image/png")}]}function p(o){var e={dataLabels:{enabled:!0,padding:0,allowOverlap:!1,formatter:d}},r=this.options.chart.events;this.exportChart({type:o},{chart:{events:{load:function(){r&&r.load&&r.load.apply(this,arguments),t.forEach(this.series,function(t){t.update(e)})}}}})}function d(){var t=this.series.chart.options,e=t.chart.type;if(t.exporting.noDataLabels||null===this.y||0===this.y&&"pie"!==e)return"";var r=o.numberFormat(this.y,1);return/[^0-9]0$/.test(r)&&(r=o.numberFormat(this.y,0)),r}function u(t){return t.series.name}function f(t){return t.y}return o.Tooltip.prototype.getPosition=function(t,o,e){var r=h.call(this,t,o,e);return r.y<this.chart.plotTop+5&&(r.y=this.chart.plotTop+5),r},t.assign(o.Axis.prototype.defaultYAxisOptions,{maxPadding:.01,minPadding:.01}),o.getDefaultMenuItems=c,o.formatTableTooltip=function(t,e){var r=a("core","highcharts:decimalPoint"),i=t?'<b class="highcharts-tooltip-header">'+t+"</b>":"";return i+='<table class="highcharts-tooltip">',e.forEach(function(t){var e=o.numberFormat(t.value,t.decimals).split(r),a=e[0],s=2===e.length?r+e[1]:"",n=t.prefix||"",h=t.suffix||"",l=' style="'+(t.valueStyle||"")+'"';i+='<tr><td class="highcharts-tooltip-label"><span style="color: '+t.color+'">●</span> '+t.name+':</td><td class="highcharts-tooltip-integer"'+l+">"+n+a+'</td><td class="highcharts-tooltip-fraction"'+l+">"+s+'</td><td class="highcharts-tooltip-suffix"'+l+">"+h+"</td>"+(t.extraColumns||"")+"</tr>"}),i+="</table>"},o.setOptions({global:{timezoneOffset:s.getMoment().utcOffset(),useUTC:!1},chart:{zoomType:"x",animation:!1,resetZoomButton:{theme:{style:{top:"display: none"}}}},plotOptions:{series:{animation:!1}},credits:{enabled:!1},legend:{borderRadius:0,borderWidth:1,borderColor:"#E3E3E3",backgroundColor:"#F5F5F5",itemStyle:{fontSize:"10px",fontWeight:"normal",fontFamily:"Arial, sans-serif"}},tooltip:{borderColor:"#000",borderWidth:1,borderRadius:0,backgroundColor:"rgba(255,255,255,.85)",shadow:!1,shape:"square",hideDelay:250,useHTML:!0,displayHeader:!0,style:{pointerEvents:"auto"},formatter:function(){var t,e=[],r=(this.point||this.points[0]).series.chart.tooltip.options,i=r.headerFormatter,a=r.rowNameFormatter||u,s=r.valueFormatter||f;t="function"==typeof i?i(this):this.key?this.key:this.points?this.points[0].key:this.series?this.series.name:this.x;var n=this.points||[{point:this.point,series:this.point.series}];return n.forEach(function(t){var o=(t=t.point).series.tooltipOptions;e.push({point:t,color:t.color||t.series.color,name:a(t),prefix:"function"==typeof o.valuePrefix?o.valuePrefix(t):o.valuePrefix,suffix:"function"==typeof o.valueSuffix?o.valueSuffix(t):o.valueSuffix,decimals:o.valueDecimals,value:(o.valueFormatter||s)(t)})}),r.extraRowsProvider&&r.extraRowsProvider(n,e),o.formatTableTooltip(t,e)}},exporting:{chartOptions:{chart:{spacing:[10,10,10,10]}},scale:1,sourceWidth:842,sourceHeight:595,url:"/reports;export"},loading:{labelStyle:{top:"20%"}}}),l(),n.subscribe("i18n.reloaded",l),o});
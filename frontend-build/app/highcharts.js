// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","highcharts","./i18n","./time","./broker","i18n!app/nls/core"],function(t,o,e,i,r){"use strict";function a(){o.setOptions({lang:{contextButtonTitle:e("core","highcharts:contextButtonTitle"),downloadJPEG:e("core","highcharts:downloadJPEG"),downloadPDF:e("core","highcharts:downloadPDF"),downloadPNG:e("core","highcharts:downloadPNG"),downloadSVG:e("core","highcharts:downloadSVG"),printChart:e("core","highcharts:printChart"),noData:e("core","highcharts:noData"),resetZoom:e("core","highcharts:resetZoom"),resetZoomTitle:e("core","highcharts:resetZoomTitle"),loading:e("core","highcharts:loading"),decimalPoint:e("core","highcharts:decimalPoint"),thousandsSep:e("core","highcharts:thousandsSep"),shortMonths:e("core","highcharts:shortMonths").split("_"),weekdays:e("core","highcharts:weekdays").split("_"),months:e("core","highcharts:months").split("_")},exporting:{buttons:{contextButton:{menuItems:s()}}}})}function s(){return[{text:e("core","highcharts:downloadPDF"),onclick:t.partial(n,"application/pdf")},{text:e("core","highcharts:downloadPNG"),onclick:t.partial(n,"image/png")}]}function n(o){var e={dataLabels:{enabled:!0,formatter:h}},i=this.options.chart.events;this.exportChart({type:o},{chart:{events:{load:function(){i&&i.load&&i.load.apply(this,arguments),t.forEach(this.series,function(t){t.update(e)})}}}})}function h(){var t=this.series,e=t.chart.options,i=e.chart.type;if(e.exporting.noDataLabels||null===this.y||0===this.y&&"pie"!==i)return"";var r=t.type;if("column"!==r&&"bar"!==r&&"pie"!==r&&t.points.length>10){if(t.index%2===0&&this.point.index%2!==0)return"";if(t.index%2!==0&&this.point.index%2===0)return""}var a=o.numberFormat(this.y,1);return/.0$/.test(a)&&(a=o.numberFormat(this.y,0)),a}function l(t){return t.series.name}function c(t){return t.y}var p=o.Tooltip.prototype.getPosition;return o.Tooltip.prototype.getPosition=function(t,o,e){var i=p.call(this,t,o,e);return i.y<this.chart.plotTop+5&&(i.y=this.chart.plotTop+5),i},t.extend(o.Axis.prototype.defaultYAxisOptions,{maxPadding:.01,minPadding:.01}),o.getDefaultMenuItems=s,o.formatTableTooltip=function(t,i){var r=e("core","highcharts:decimalPoint"),a=t?'<b class="highcharts-tooltip-header">'+t+"</b>":"";return a+='<table class="highcharts-tooltip">',i.forEach(function(t){var e=o.numberFormat(t.value,t.decimals).split(r),i=e[0],s=2===e.length?r+e[1]:"",n=t.prefix||"",h=t.suffix||"",l=' style="'+(t.valueStyle||"")+'"';a+='<tr><td class="highcharts-tooltip-label"><span style="color: '+t.color+'">●</span> '+t.name+':</td><td class="highcharts-tooltip-integer"'+l+">"+n+i+'</td><td class="highcharts-tooltip-fraction"'+l+">"+s+'</td><td class="highcharts-tooltip-suffix"'+l+">"+h+"</td>"+(t.extraColumns||"")+"</tr>"}),a+="</table>"},o.setOptions({global:{timezoneOffset:i.getMoment().utcOffset(),useUTC:!1},chart:{zoomType:"x",animation:!1,resetZoomButton:{theme:{style:{top:"display: none"}}}},plotOptions:{series:{animation:!1}},credits:{enabled:!1},legend:{borderRadius:0,borderWidth:1,borderColor:"#E3E3E3",backgroundColor:"#F5F5F5",itemStyle:{fontSize:"10px",fontWeight:"normal",fontFamily:"Arial, sans-serif"}},tooltip:{borderColor:"#000",borderWidth:1,borderRadius:0,backgroundColor:"rgba(255,255,255,.85)",shadow:!1,shape:"square",hideDelay:250,useHTML:!0,displayHeader:!0,formatter:function(){var t,e=[],i=(this.point||this.points[0]).series.chart.tooltip.options,r=i.headerFormatter,a=i.rowNameFormatter||l,s=i.valueFormatter||c;t="function"==typeof r?r(this):this.key?this.key:this.points?this.points[0].key:this.series?this.series.name:this.x;var n=this.points||[{point:this.point,series:this.point.series}];return n.forEach(function(t){t=t.point;var o=t.series.tooltipOptions;e.push({point:t,color:t.color||t.series.color,name:a(t),prefix:"function"==typeof o.valuePrefix?o.valuePrefix(t):o.valuePrefix,suffix:"function"==typeof o.valueSuffix?o.valueSuffix(t):o.valueSuffix,decimals:o.valueDecimals,value:(o.valueFormatter||s)(t)})}),i.extraRowsProvider&&i.extraRowsProvider(n,e),o.formatTableTooltip(t,e)}},exporting:{chartOptions:{chart:{spacing:[10,10,10,10]}},scale:1,sourceWidth:848,sourceHeight:600,url:"/reports;export"},loading:{labelStyle:{top:"20%"}}}),a(),r.subscribe("i18n.reloaded",a),o});
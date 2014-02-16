/**
 * @license Highcharts JS v3.0.8 (2014-01-09)
 * Exporting module
 *
 * (c) 2010-2014 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */

!function(e){var t,n,r=e.Chart,i=e.addEvent,o=e.removeEvent,a=e.createElement,s=e.discardElement,l=e.css,u=e.merge,c=e.each,d=e.extend,p=Math,h=p.max,f=document,m=window,g=e.isTouchDevice,v="M",y="L",w="div",b="hidden",E="none",P="highcharts-",T="absolute",R="px",k=e.Renderer.prototype.symbols,A=e.getOptions();d(A.lang,{printChart:"Print chart",downloadPNG:"Download PNG image",downloadJPEG:"Download JPEG image",downloadPDF:"Download PDF document",downloadSVG:"Download SVG vector image",contextButtonTitle:"Chart context menu"}),A.navigation={menuStyle:{border:"1px solid #A0A0A0",background:"#FFFFFF",padding:"5px 0"},menuItemStyle:{padding:"0 10px",background:E,color:"#303030",fontSize:g?"14px":"11px"},menuItemHoverStyle:{background:"#4572A5",color:"#FFFFFF"},buttonOptions:{symbolFill:"#E0E0E0",symbolSize:14,symbolStroke:"#666",symbolStrokeWidth:3,symbolX:12.5,symbolY:10.5,align:"right",buttonSpacing:3,height:22,theme:{fill:"white",stroke:"none"},verticalAlign:"top",width:24}},A.exporting={type:"image/png",url:"http://export.highcharts.com/",buttons:{contextButton:{menuClassName:P+"contextmenu",symbol:"menu",_titleKey:"contextButtonTitle",menuItems:[{textKey:"printChart",onclick:function(){this.print()}},{separator:!0},{textKey:"downloadPNG",onclick:function(){this.exportChart()}},{textKey:"downloadJPEG",onclick:function(){this.exportChart({type:"image/jpeg"})}},{textKey:"downloadPDF",onclick:function(){this.exportChart({type:"application/pdf"})}},{textKey:"downloadSVG",onclick:function(){this.exportChart({type:"image/svg+xml"})}}]}}},e.post=function(e,t,n){var r,i;i=a("form",u({method:"post",action:e,enctype:"multipart/form-data"},n),{display:E},f.body);for(r in t)a("input",{type:b,name:r,value:t[r]},null,i);i.submit(),s(i)},d(r.prototype,{getSVG:function(n){var r,i,o,l,p,h,m,g,v=this,y=u(v.options,n);return f.createElementNS||(f.createElementNS=function(e,t){return f.createElement(t)}),i=a(w,null,{position:T,top:"-9999em",width:v.chartWidth+R,height:v.chartHeight+R},f.body),m=v.renderTo.style.width,g=v.renderTo.style.height,p=y.exporting.sourceWidth||y.chart.width||/px$/.test(m)&&parseInt(m,10)||600,h=y.exporting.sourceHeight||y.chart.height||/px$/.test(g)&&parseInt(g,10)||400,d(y.chart,{animation:!1,renderTo:i,forExport:!0,width:p,height:h}),y.exporting.enabled=!1,y.series=[],c(v.series,function(e){l=u(e.options,{animation:!1,showCheckbox:!1,visible:e.visible}),l.isInternal||y.series.push(l)}),r=new e.Chart(y,v.callback),c(["xAxis","yAxis"],function(e){c(v[e],function(n,i){var o=r[e][i],a=n.getExtremes(),s=a.userMin,l=a.userMax;!o||s===t&&l===t||o.setExtremes(s,l,!0,!1)})}),o=r.container.innerHTML,y=null,r.destroy(),s(i),o=o.replace(/zIndex="[^"]+"/g,"").replace(/isShadow="[^"]+"/g,"").replace(/symbolName="[^"]+"/g,"").replace(/jQuery[0-9]+="[^"]+"/g,"").replace(/url\([^#]+#/g,"url(#").replace(/<svg /,'<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/ href=/g," xlink:href=").replace(/\n/," ").replace(/<\/svg>.*?$/,"</svg>").replace(/&nbsp;/g," ").replace(/&shy;/g,"­").replace(/<IMG /g,"<image ").replace(/height=([^" ]+)/g,'height="$1"').replace(/width=([^" ]+)/g,'width="$1"').replace(/hc-svg-href="([^"]+)">/g,'xlink:href="$1"/>').replace(/id=([^" >]+)/g,'id="$1"').replace(/class=([^" >]+)/g,'class="$1"').replace(/ transform /g," ").replace(/:(path|rect)/g,"$1").replace(/style="([^"]+)"/g,function(e){return e.toLowerCase()}),o=o.replace(/(url\(#highcharts-[0-9]+)&quot;/g,"$1").replace(/&quot;/g,"'")},exportChart:function(t,n){t=t||{};var r=this,i=r.options.exporting,o=r.getSVG(u({chart:{borderRadius:0}},i.chartOptions,n,{exporting:{sourceWidth:t.sourceWidth||i.sourceWidth,sourceHeight:t.sourceHeight||i.sourceHeight}}));t=u(r.options.exporting,t),e.post(t.url,{filename:t.filename||"chart",type:t.type,width:t.width||0,scale:t.scale||2,svg:o},t.formAttributes)},print:function(){var e=this,t=e.container,n=[],r=t.parentNode,i=f.body,o=i.childNodes;e.isPrinting||(e.isPrinting=!0,c(o,function(e,t){1===e.nodeType&&(n[t]=e.style.display,e.style.display=E)}),i.appendChild(t),m.focus(),m.print(),setTimeout(function(){r.appendChild(t),c(o,function(e,t){1===e.nodeType&&(e.style.display=n[t])}),e.isPrinting=!1},1e3))},contextMenu:function(e,t,n,r,s,u,p){var f,m,g,v,y=this,b=y.options.navigation,P=b.menuItemStyle,k=y.chartWidth,A=y.chartHeight,O="cache-"+e,x=y[O],C=h(s,u),S="3px 3px 10px #888",D=function(t){y.pointer.inClass(t.target,e)||m()};x||(y[O]=x=a(w,{className:e},{position:T,zIndex:1e3,padding:C+R},y.container),f=a(w,null,d({MozBoxShadow:S,WebkitBoxShadow:S,boxShadow:S},b.menuStyle),x),m=function(){l(x,{display:E}),p&&p.setState(0),y.openMenu=!1},i(x,"mouseleave",function(){g=setTimeout(m,500)}),i(x,"mouseenter",function(){clearTimeout(g)}),i(document,"mouseup",D),i(y,"destroy",function(){o(document,"mouseup",D)}),c(t,function(e){if(e){var t=e.separator?a("hr",null,null,f):a(w,{onmouseover:function(){l(this,b.menuItemHoverStyle)},onmouseout:function(){l(this,P)},onclick:function(){m(),e.onclick.apply(y,arguments)},innerHTML:e.text||y.options.lang[e.textKey]},d({cursor:"pointer"},P),f);y.exportDivElements.push(t)}}),y.exportDivElements.push(f,x),y.exportMenuWidth=x.offsetWidth,y.exportMenuHeight=x.offsetHeight),v={display:"block"},n+y.exportMenuWidth>k?v.right=k-n-s-C+R:v.left=n-C+R,r+u+y.exportMenuHeight>A&&"top"!==p.alignOptions.verticalAlign?v.bottom=A-r-C+R:v.top=r+u-C+R,l(x,v),y.openMenu=!0},addButton:function(t){var r,i,o=this,a=o.renderer,s=u(o.options.navigation.buttonOptions,t),l=s.onclick,c=s.menuItems,p={stroke:s.symbolStroke,fill:s.symbolFill},h=s.symbolSize||12;if(o.btnCount||(o.btnCount=0),o.exportDivElements||(o.exportDivElements=[],o.exportSVGElements=[]),s.enabled!==!1){var f,m=s.theme,g=m.states,v=g&&g.hover,y=g&&g.select;delete m.states,l?f=function(){l.apply(o,arguments)}:c&&(f=function(){o.contextMenu(i.menuClassName,c,i.translateX,i.translateY,i.width,i.height,i),i.setState(2)}),s.text&&s.symbol?m.paddingLeft=e.pick(m.paddingLeft,25):s.text||d(m,{width:s.width,height:s.height,padding:0}),i=a.button(s.text,0,0,f,m,v,y).attr({title:o.options.lang[s._titleKey],"stroke-linecap":"round"}),i.menuClassName=t.menuClassName||P+"menu-"+o.btnCount++,s.symbol&&(r=a.symbol(s.symbol,s.symbolX-h/2,s.symbolY-h/2,h,h).attr(d(p,{"stroke-width":s.symbolStrokeWidth||1,zIndex:1})).add(i)),i.add().align(d(s,{width:i.width,x:e.pick(s.x,n)}),!0,"spacingBox"),n+=(i.width+s.buttonSpacing)*("right"===s.align?-1:1),o.exportSVGElements.push(i,r)}},destroyExport:function(e){var t,n,r=e.target;for(t=0;t<r.exportSVGElements.length;t++)n=r.exportSVGElements[t],n&&(n.onclick=n.ontouchstart=null,r.exportSVGElements[t]=n.destroy());for(t=0;t<r.exportDivElements.length;t++)n=r.exportDivElements[t],o(n,"mouseleave"),r.exportDivElements[t]=n.onmouseout=n.onmouseover=n.ontouchstart=n.onclick=null,s(n)}}),k.menu=function(e,t,n,r){var i=[v,e,t+2.5,y,e+n,t+2.5,v,e,t+r/2+.5,y,e+n,t+r/2+.5,v,e,t+r-1.5,y,e+n,t+r-1.5];return i},r.prototype.callbacks.push(function(e){var t,r=e.options.exporting,o=r.buttons;if(n=0,r.enabled!==!1){for(t in o)e.addButton(o[t]);i(e,"destroy",e.destroyExport)}})}(Highcharts);
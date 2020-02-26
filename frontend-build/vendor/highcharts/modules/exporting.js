!function(e){"object"==typeof module&&module.exports?(e.default=e,module.exports=e):"function"==typeof define&&define.amd?define("highcharts/modules/exporting",["highcharts"],function(t){return e(t),e.Highcharts=t,e}):e("undefined"!=typeof Highcharts?Highcharts:void 0)}(function(e){var t=e?e._modules:{};function n(e,t,n,i){e.hasOwnProperty(t)||(e[t]=i.apply(null,n))}n(t,"modules/full-screen.src.js",[t["parts/Globals.js"]],function(e){(e.FullScreen=function(e){this.init(e.parentNode)}).prototype={init:function(e){var t;e.requestFullscreen?t=e.requestFullscreen():e.mozRequestFullScreen?t=e.mozRequestFullScreen():e.webkitRequestFullscreen?t=e.webkitRequestFullscreen():e.msRequestFullscreen&&(t=e.msRequestFullscreen()),t&&t.catch(function(){alert("Full screen is not supported inside a frame")})}}}),n(t,"mixins/navigation.js",[],function(){return{initUpdate:function(e){e.navigation||(e.navigation={updates:[],update:function(e,t){this.updates.forEach(function(n){n.update.call(n.context,e,t)})}})},addUpdate:function(e,t){t.navigation||this.initUpdate(t),t.navigation.updates.push({update:e,context:t})}}}),n(t,"modules/exporting.src.js",[t["parts/Globals.js"],t["parts/Utilities.js"],t["mixins/navigation.js"]],function(e,t,n){var i=t.discardElement,o=t.extend,r=t.isObject,s=t.objectEach,a=t.pick,l=e.defaultOptions,p=e.doc,u=e.Chart,c=e.addEvent,d=e.removeEvent,h=e.fireEvent,g=e.createElement,f=e.css,m=e.merge,x=e.isTouchDevice,y=e.win,v=y.navigator.userAgent,b=e.SVGRenderer,w=e.Renderer.prototype.symbols,E=/Edge\/|Trident\/|MSIE /.test(v),S=/firefox/i.test(v);o(l.lang,{viewFullscreen:"View in full screen",printChart:"Print chart",downloadPNG:"Download PNG image",downloadJPEG:"Download JPEG image",downloadPDF:"Download PDF document",downloadSVG:"Download SVG vector image",contextButtonTitle:"Chart context menu"}),l.navigation||(l.navigation={}),m(!0,l.navigation,{buttonOptions:{theme:{},symbolSize:14,symbolX:12.5,symbolY:10.5,align:"right",buttonSpacing:3,height:22,verticalAlign:"top",width:24}}),m(!0,l.navigation,{menuStyle:{border:"1px solid #999999",background:"#ffffff",padding:"5px 0"},menuItemStyle:{padding:"0.5em 1em",color:"#333333",background:"none",fontSize:x?"14px":"11px",transition:"background 250ms, color 250ms"},menuItemHoverStyle:{background:"#335cad",color:"#ffffff"},buttonOptions:{symbolFill:"#666666",symbolStroke:"#666666",symbolStrokeWidth:3,theme:{padding:5}}}),l.exporting={type:"image/png",url:"https://export.highcharts.com/",printMaxWidth:780,scale:2,buttons:{contextButton:{className:"highcharts-contextbutton",menuClassName:"highcharts-contextmenu",symbol:"menu",titleKey:"contextButtonTitle",menuItems:["viewFullscreen","printChart","separator","downloadPNG","downloadJPEG","downloadPDF","downloadSVG"]}},menuItemDefinitions:{viewFullscreen:{textKey:"viewFullscreen",onclick:function(){this.fullscreen=new e.FullScreen(this.container)}},printChart:{textKey:"printChart",onclick:function(){this.print()}},separator:{separator:!0},downloadPNG:{textKey:"downloadPNG",onclick:function(){this.exportChart()}},downloadJPEG:{textKey:"downloadJPEG",onclick:function(){this.exportChart({type:"image/jpeg"})}},downloadPDF:{textKey:"downloadPDF",onclick:function(){this.exportChart({type:"application/pdf"})}},downloadSVG:{textKey:"downloadSVG",onclick:function(){this.exportChart({type:"image/svg+xml"})}}}},e.post=function(e,t,n){var o=g("form",m({method:"post",action:e,enctype:"multipart/form-data"},n),{display:"none"},p.body);s(t,function(e,t){g("input",{type:"hidden",name:t,value:e},null,o)}),o.submit(),i(o)},o(u.prototype,{sanitizeSVG:function(e,t){var n=e.indexOf("</svg>")+6,i=e.substr(n);return e=e.substr(0,n),t&&t.exporting&&t.exporting.allowHTML&&i&&(i='<foreignObject x="0" y="0" width="'+t.chart.width+'" height="'+t.chart.height+'"><body xmlns="http://www.w3.org/1999/xhtml">'+i+"</body></foreignObject>",e=e.replace("</svg>",i+"</svg>")),e=e.replace(/zIndex="[^"]+"/g,"").replace(/symbolName="[^"]+"/g,"").replace(/jQuery[0-9]+="[^"]+"/g,"").replace(/url\(("|&quot;)(.*?)("|&quot;)\;?\)/g,"url($2)").replace(/url\([^#]+#/g,"url(#").replace(/<svg /,'<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/ (|NS[0-9]+\:)href=/g," xlink:href=").replace(/\n/," ").replace(/(fill|stroke)="rgba\(([ 0-9]+,[ 0-9]+,[ 0-9]+),([ 0-9\.]+)\)"/g,'$1="rgb($2)" $1-opacity="$3"').replace(/&nbsp;/g," ").replace(/&shy;/g,"­"),this.ieSanitizeSVG&&(e=this.ieSanitizeSVG(e)),e},getChartHTML:function(){return this.styledMode&&this.inlineStyles(),this.container.innerHTML},getSVG:function(t){var n,r,s,a,l,u,c,d,f=m(this.options,t);return f.plotOptions=m(this.userOptions.plotOptions,t&&t.plotOptions),f.time=m(this.userOptions.time,t&&t.time),r=g("div",null,{position:"absolute",top:"-9999em",width:this.chartWidth+"px",height:this.chartHeight+"px"},p.body),c=this.renderTo.style.width,d=this.renderTo.style.height,l=f.exporting.sourceWidth||f.chart.width||/px$/.test(c)&&parseInt(c,10)||(f.isGantt?800:600),u=f.exporting.sourceHeight||f.chart.height||/px$/.test(d)&&parseInt(d,10)||400,o(f.chart,{animation:!1,renderTo:r,forExport:!0,renderer:"SVGRenderer",width:l,height:u}),f.exporting.enabled=!1,delete f.data,f.series=[],this.series.forEach(function(e){(a=m(e.userOptions,{animation:!1,enableMouseTracking:!1,showCheckbox:!1,visible:e.visible})).isInternal||f.series.push(a)}),this.axes.forEach(function(t){t.userOptions.internalKey||(t.userOptions.internalKey=e.uniqueKey())}),n=new e.Chart(f,this.callback),t&&["xAxis","yAxis","series"].forEach(function(e){var i={};t[e]&&(i[e]=t[e],n.update(i))}),this.axes.forEach(function(t){var i=e.find(n.axes,function(e){return e.options.internalKey===t.userOptions.internalKey}),o=t.getExtremes(),r=o.userMin,s=o.userMax;i&&(void 0!==r&&r!==i.min||void 0!==s&&s!==i.max)&&i.setExtremes(r,s,!0,!1)}),s=n.getChartHTML(),h(this,"getSVG",{chartCopy:n}),s=this.sanitizeSVG(s,f),f=null,n.destroy(),i(r),s},getSVGForExport:function(e,t){var n=this.options.exporting;return this.getSVG(m({chart:{borderRadius:0}},n.chartOptions,t,{exporting:{sourceWidth:e&&e.sourceWidth||n.sourceWidth,sourceHeight:e&&e.sourceHeight||n.sourceHeight}}))},getFilename:function(){var e=this.userOptions.title&&this.userOptions.title.text,t=this.options.exporting.filename;return t||("string"==typeof e&&(t=e.toLowerCase().replace(/<\/?[^>]+(>|$)/g,"").replace(/[\s_]+/g,"-").replace(/[^a-z0-9\-]/g,"").replace(/^[\-]+/g,"").replace(/[\-]+/g,"-").substr(0,24).replace(/[\-]+$/g,"")),(!t||t.length<5)&&(t="chart"),t)},exportChart:function(t,n){var i=this.getSVGForExport(t,n);t=m(this.options.exporting,t),e.post(t.url,{filename:t.filename||this.getFilename(),type:t.type,width:t.width||0,scale:t.scale,svg:i},t.formAttributes)},print:function(){var e,t,n=this,i=[],o=p.body,r=o.childNodes,s=n.options.exporting.printMaxWidth;function a(e){(n.fixedDiv?[n.fixedDiv,n.scrollingContainer]:[n.container]).forEach(function(t){e.appendChild(t)})}n.isPrinting||(n.isPrinting=!0,n.pointer.reset(null,0),h(n,"beforePrint"),(t=s&&n.chartWidth>s)&&(e=[n.options.chart.width,void 0,!1],n.setSize(s,void 0,!1)),[].forEach.call(r,function(e,t){1===e.nodeType&&(i[t]=e.style.display,e.style.display="none")}),a(o),setTimeout(function(){y.focus(),y.print(),setTimeout(function(){a(n.renderTo),[].forEach.call(r,function(e,t){1===e.nodeType&&(e.style.display=i[t]||"")}),n.isPrinting=!1,t&&n.setSize.apply(n,e),h(n,"afterPrint")},1e3)},1))},contextMenu:function(t,n,i,s,a,l,u){var d,m,x=this,v=x.options.navigation,b=x.chartWidth,w=x.chartHeight,E="cache-"+t,S=x[E],k=Math.max(a,l);S||(x.exportContextMenu=x[E]=S=g("div",{className:t},{position:"absolute",zIndex:1e3,padding:k+"px",pointerEvents:"auto"},x.fixedDiv||x.container),d=g("div",{className:"highcharts-menu"},null,S),x.styledMode||f(d,o({MozBoxShadow:"3px 3px 10px #888",WebkitBoxShadow:"3px 3px 10px #888",boxShadow:"3px 3px 10px #888"},v.menuStyle)),S.hideMenu=function(){f(S,{display:"none"}),u&&u.setState(0),x.openMenu=!1,f(x.renderTo,{overflow:"hidden"}),e.clearTimeout(S.hideTimer),h(x,"exportMenuHidden")},x.exportEvents.push(c(S,"mouseleave",function(){S.hideTimer=y.setTimeout(S.hideMenu,500)}),c(S,"mouseenter",function(){e.clearTimeout(S.hideTimer)}),c(p,"mouseup",function(e){x.pointer.inClass(e.target,t)||S.hideMenu()}),c(S,"click",function(){x.openMenu&&S.hideMenu()})),n.forEach(function(e){var t;("string"==typeof e&&(e=x.options.exporting.menuItemDefinitions[e]),r(e,!0))&&(e.separator?t=g("hr",null,null,d):(t=g("div",{className:"highcharts-menu-item",onclick:function(t){t&&t.stopPropagation(),S.hideMenu(),e.onclick&&e.onclick.apply(x,arguments)},innerHTML:e.text||x.options.lang[e.textKey]},null,d),x.styledMode||(t.onmouseover=function(){f(this,v.menuItemHoverStyle)},t.onmouseout=function(){f(this,v.menuItemStyle)},f(t,o({cursor:"pointer"},v.menuItemStyle)))),x.exportDivElements.push(t))}),x.exportDivElements.push(d,S),x.exportMenuWidth=S.offsetWidth,x.exportMenuHeight=S.offsetHeight),m={display:"block"},i+x.exportMenuWidth>b?m.right=b-i-a-k+"px":m.left=i-k+"px",s+l+x.exportMenuHeight>w&&"top"!==u.alignOptions.verticalAlign?m.bottom=w-s-k+"px":m.top=s+l-k+"px",f(S,m),f(x.renderTo,{overflow:""}),x.openMenu=!0,h(x,"exportMenuShown")},addButton:function(e){var t,n,i=this,r=i.renderer,s=m(i.options.navigation.buttonOptions,e),l=s.onclick,p=s.menuItems,u=s.symbolSize||12;if(i.btnCount||(i.btnCount=0),i.exportDivElements||(i.exportDivElements=[],i.exportSVGElements=[]),!1!==s.enabled){var c,d=s.theme,h=d.states,g=h&&h.hover,f=h&&h.select;i.styledMode||(d.fill=a(d.fill,"#ffffff"),d.stroke=a(d.stroke,"none")),delete d.states,l?c=function(e){e&&e.stopPropagation(),l.call(i,e)}:p&&(c=function(e){e&&e.stopPropagation(),i.contextMenu(n.menuClassName,p,n.translateX,n.translateY,n.width,n.height,n),n.setState(2)}),s.text&&s.symbol?d.paddingLeft=a(d.paddingLeft,25):s.text||o(d,{width:s.width,height:s.height,padding:0}),i.styledMode||(d["stroke-linecap"]="round",d.fill=a(d.fill,"#ffffff"),d.stroke=a(d.stroke,"none")),(n=r.button(s.text,0,0,c,d,g,f).addClass(e.className).attr({title:a(i.options.lang[s._titleKey||s.titleKey],"")})).menuClassName=e.menuClassName||"highcharts-menu-"+i.btnCount++,s.symbol&&(t=r.symbol(s.symbol,s.symbolX-u/2,s.symbolY-u/2,u,u,{width:u,height:u}).addClass("highcharts-button-symbol").attr({zIndex:1}).add(n),i.styledMode||t.attr({stroke:s.symbolStroke,fill:s.symbolFill,"stroke-width":s.symbolStrokeWidth||1})),n.add(i.exportingGroup).align(o(s,{width:n.width,x:a(s.x,i.buttonOffset)}),!0,"spacingBox"),i.buttonOffset+=(n.width+s.buttonSpacing)*("right"===s.align?-1:1),i.exportSVGElements.push(n,t)}},destroyExport:function(t){var n,o=t?t.target:this,r=o.exportSVGElements,s=o.exportDivElements,a=o.exportEvents;r&&(r.forEach(function(e,t){e&&(e.onclick=e.ontouchstart=null,n="cache-"+e.menuClassName,o[n]&&delete o[n],o.exportSVGElements[t]=e.destroy())}),r.length=0),o.exportingGroup&&(o.exportingGroup.destroy(),delete o.exportingGroup),s&&(s.forEach(function(t,n){e.clearTimeout(t.hideTimer),d(t,"mouseleave"),o.exportDivElements[n]=t.onmouseout=t.onmouseover=t.ontouchstart=t.onclick=null,i(t)}),s.length=0),a&&(a.forEach(function(e){e()}),a.length=0)}}),b.prototype.inlineToAttributes=["fill","stroke","strokeLinecap","strokeLinejoin","strokeWidth","textAnchor","x","y"],b.prototype.inlineBlacklist=[/-/,/^(clipPath|cssText|d|height|width)$/,/^font$/,/[lL]ogical(Width|Height)$/,/perspective/,/TapHighlightColor/,/^transition/,/^length$/],b.prototype.unstyledElements=["clipPath","defs","desc"],u.prototype.inlineStyles=function(){var e,t,n,i=this.renderer,o=i.inlineToAttributes,r=i.inlineBlacklist,a=i.inlineWhitelist,l=i.unstyledElements,u={};function c(e){return e.replace(/([A-Z])/g,function(e,t){return"-"+t.toLowerCase()})}t=p.createElement("iframe"),f(t,{width:"1px",height:"1px",visibility:"hidden"}),p.body.appendChild(t),(n=t.contentWindow.document).open(),n.write('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),n.close(),function t(i){var p,d,h,g,f,x,v,b="";function w(e,t){if(f=x=!1,a){for(v=a.length;v--&&!x;)x=a[v].test(t);f=!x}for("transform"===t&&"none"===e&&(f=!0),v=r.length;v--&&!f;)f=r[v].test(t)||"function"==typeof e;f||d[t]===e&&"svg"!==i.nodeName||u[i.nodeName][t]===e||(-1!==o.indexOf(t)?i.setAttribute(c(t),e):b+=c(t)+":"+e+";")}if(1===i.nodeType&&-1===l.indexOf(i.nodeName)){if(p=y.getComputedStyle(i,null),d="svg"===i.nodeName?{}:y.getComputedStyle(i.parentNode,null),u[i.nodeName]||(e=n.getElementsByTagName("svg")[0],h=n.createElementNS(i.namespaceURI,i.nodeName),e.appendChild(h),u[i.nodeName]=m(y.getComputedStyle(h,null)),"text"===i.nodeName&&delete u.text.fill,e.removeChild(h)),S||E)for(var k in p)w(p[k],k);else s(p,w);if(b&&(g=i.getAttribute("style"),i.setAttribute("style",(g?g+";":"")+b)),"svg"===i.nodeName&&i.setAttribute("stroke-width","1px"),"text"===i.nodeName)return;[].forEach.call(i.children||i.childNodes,t)}}(this.container.querySelector("svg")),e.parentNode.removeChild(e)},w.menu=function(e,t,n,i){return["M",e,t+2.5,"L",e+n,t+2.5,"M",e,t+i/2+.5,"L",e+n,t+i/2+.5,"M",e,t+i-1.5,"L",e+n,t+i-1.5]},w.menuball=function(e,t,n,i){var o=[],r=i/3-2;return o=o.concat(this.circle(n-r,t,r,r),this.circle(n-r,t+r+4,r,r),this.circle(n-r,t+2*(r+4),r,r))},u.prototype.renderExporting=function(){var e=this,t=e.options.exporting,n=t.buttons,i=e.isDirtyExporting||!e.exportSVGElements;e.buttonOffset=0,e.isDirtyExporting&&e.destroyExport(),i&&!1!==t.enabled&&(e.exportEvents=[],e.exportingGroup=e.exportingGroup||e.renderer.g("exporting-group").attr({zIndex:3}).add(),s(n,function(t){e.addButton(t)}),e.isDirtyExporting=!1),c(e,"destroy",e.destroyExport)},c(u,"init",function(){var e=this;function t(t,n,i){e.isDirtyExporting=!0,m(!0,e.options[t],n),a(i,!0)&&e.redraw()}e.exporting={update:function(e,n){t("exporting",e,n)}},n.addUpdate(function(e,n){t("navigation",e,n)},e)}),u.prototype.callbacks.push(function(e){e.renderExporting(),c(e,"redraw",e.renderExporting)})}),n(t,"masters/modules/exporting.src.js",[],function(){})});
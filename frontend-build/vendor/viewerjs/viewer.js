/*!
 * Viewer.js v0.5.0
 * https://github.com/fengyuanchen/viewerjs
 *
 * Copyright (c) 2015-2016 Fengyuan Chen
 * Released under the MIT license
 *
 * Date: 2016-07-22T08:46:05.003Z
 */

!function(e,t){"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("Viewer requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(e,t){"use strict";function i(e){return Ae.call(e).slice(8,-1).toLowerCase()}function n(e){return"string"==typeof e}function a(e){return"number"==typeof e&&!isNaN(e)}function o(e){return"undefined"==typeof e}function r(e){return"object"==typeof e&&null!==e}function s(e){var t,i;if(!r(e))return!1;try{return t=e.constructor,i=t.prototype,t&&i&&Re.call(i,"isPrototypeOf")}catch(e){return!1}}function l(e){return"function"===i(e)}function u(e){return Array.isArray?Array.isArray(e):"array"===i(e)}function c(e,t){return t=t>=0?t:0,Array.from?Array.from(e).slice(t):We.call(e,t)}function d(e,t){var i=-1;return t.indexOf?t.indexOf(e):(h(t,function(t,n){if(t===e)return i=n,!1}),i)}function m(e){return n(e)&&(e=e.trim?e.trim():e.replace(ke,"1")),e}function h(e,t){var i,n;if(e&&l(t))if(u(e)||a(e.length))for(n=0,i=e.length;n<i&&t.call(e,e[n],n,e)!==!1;n++);else if(r(e))for(n in e)if(e.hasOwnProperty(n)&&t.call(e,e[n],n,e)===!1)break;return e}function f(e){var t;if(arguments.length>1){if(t=c(arguments),Object.assign)return Object.assign.apply(Object,t);t.shift(),h(t,function(t){h(t,function(t,i){e[i]=t})})}return e}function v(e,t){var i=c(arguments,2);return function(){return e.apply(t,i.concat(c(arguments)))}}function g(e,t){var i=e.style;h(t,function(e,t){Le.test(t)&&a(e)&&(e+="px"),i[t]=e})}function w(t){return e.getComputedStyle?e.getComputedStyle(t,null):t.currentStyle}function p(e,t){return e.classList?e.classList.contains(t):e.className.indexOf(t)>-1}function b(e,t){var i;if(t){if(a(e.length))return h(e,function(e){b(e,t)});if(e.classList)return e.classList.add(t);i=m(e.className),i?i.indexOf(t)<0&&(e.className=i+" "+t):e.className=t}}function y(e,t){if(t)return a(e.length)?h(e,function(e){y(e,t)}):e.classList?e.classList.remove(t):void(e.className.indexOf(t)>=0&&(e.className=e.className.replace(t,"")))}function x(e,t,i){return a(e.length)?h(e,function(e){x(e,t,i)}):void(i?b(e,t):y(e,t))}function z(e){return e.replace(Ye,"$1-$2").toLowerCase()}function E(e,t){return r(e[t])?e[t]:e.dataset?e.dataset[t]:e.getAttribute("data-"+z(t))}function D(e,t,i){r(i)?e[t]=i:e.dataset?e.dataset[t]=i:e.setAttribute("data-"+z(t),i)}function I(e,t){r(e[t])?delete e[t]:e.dataset?delete e.dataset[t]:e.removeAttribute("data-"+z(t))}function L(e,t,i,n){var a=m(t).split(Te),o=i;return a.length>1?h(a,function(t){L(e,t,i)}):(n&&(i=function(){return Y(e,t,i),o.apply(e,arguments)}),void(e.addEventListener?e.addEventListener(t,i,!1):e.attachEvent&&e.attachEvent("on"+t,i)))}function Y(e,t,i){var n=m(t).split(Te);return n.length>1?h(n,function(t){Y(e,t,i)}):void(e.removeEventListener?e.removeEventListener(t,i,!1):e.detachEvent&&e.detachEvent("on"+t,i))}function k(e,t,i){var n;return e.dispatchEvent?(l(j)&&l(CustomEvent)?n=o(i)?new j(t,{bubbles:!0,cancelable:!0}):new CustomEvent(t,{detail:i,bubbles:!0,cancelable:!0}):o(i)?(n=H.createEvent("Event"),n.initEvent(t,!0,!0)):(n=H.createEvent("CustomEvent"),n.initCustomEvent(t,!0,!0,i)),e.dispatchEvent(n)):e.fireEvent?e.fireEvent("on"+t):void 0}function T(e){e.preventDefault?e.preventDefault():e.returnValue=!1}function F(t){var i,n=t||e.event;return n.target||(n.target=n.srcElement||H),a(n.pageX)||(i=H.documentElement,n.pageX=n.clientX+(e.scrollX||i&&i.scrollLeft||0)-(i&&i.clientLeft||0),n.pageY=n.clientY+(e.scrollY||i&&i.scrollTop||0)-(i&&i.clientTop||0)),n}function X(t){var i=H.documentElement,n=t.getBoundingClientRect();return{left:n.left+(e.scrollX||i&&i.scrollLeft||0)-(i&&i.clientLeft||0),top:n.top+(e.scrollY||i&&i.scrollTop||0)-(i&&i.clientTop||0)}}function S(e){var t=e.length,i=0,n=0;return t&&(h(e,function(e){i+=e.pageX,n+=e.pageY}),i/=t,n/=t),{pageX:i,pageY:n}}function V(e,t){return e.getElementsByTagName(t)}function N(e,t){return e.getElementsByClassName?e.getElementsByClassName(t):e.querySelectorAll("."+t)}function C(e,t){return t.length?h(t,function(t){C(e,t)}):void e.appendChild(t)}function P(e){e.parentNode&&e.parentNode.removeChild(e)}function A(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function R(e,t){o(e.textContent)?e.innerText=t:e.textContent=t}function W(e){return e.offsetWidth}function _(e){return n(e)?e.replace(/^.*\//,"").replace(/[\?&#].*$/,""):""}function q(e,t){var i;return e.naturalWidth?t(e.naturalWidth,e.naturalHeight):(i=H.createElement("img"),i.onload=function(){t(this.width,this.height)},void(i.src=e.src))}function M(e){var t=[],i=e.rotate,n=e.scaleX,o=e.scaleY;return a(i)&&t.push("rotate("+i+"deg)"),a(n)&&t.push("scaleX("+n+")"),a(o)&&t.push("scaleY("+o+")"),t.length?t.join(" "):"none"}function B(e){switch(e){case 2:return J;case 3:return Q;case 4:return ee}}function O(e,t){var i=this;i.element=e,i.options=f({},O.DEFAULTS,s(t)&&t),i.isImg=!1,i.isBuilt=!1,i.isShown=!1,i.isViewed=!1,i.isFulled=!1,i.isPlayed=!1,i.wheeling=!1,i.playing=!1,i.fading=!1,i.tooltiping=!1,i.transitioning=!1,i.action=!1,i.target=!1,i.timeout=!1,i.index=i.options.initialIndex||0,i.length=0,i.init()}var H=e.document,j=e.Event,U="viewer",Z=U+"-fixed",$=U+"-open",K=U+"-show",G=U+"-hide",J="viewer-hide-xs-down",Q="viewer-hide-sm-down",ee="viewer-hide-md-down",te=U+"-fade",ie=U+"-in",ne=U+"-move",ae=U+"-active",oe=U+"-invisible",re=U+"-transition",se=U+"-fullscreen",le=U+"-fullscreen-exit",ue=U+"-close",ce="mousedown touchstart pointerdown MSPointerDown",de="mousemove touchmove pointermove MSPointerMove",me="mouseup touchend touchcancel pointerup pointercancel MSPointerUp MSPointerCancel",he="wheel mousewheel DOMMouseScroll",fe="transitionend",ve="load",ge="keydown",we="click",pe="resize",be="ready",ye="show",xe="shown",ze="hide",Ee="hidden",De="view",Ie="viewed",Le=/^(width|height|left|top|marginLeft|marginTop)$/,Ye=/([a-z\d])([A-Z])/g,ke=/^\s+(.*)\s+$/,Te=/\s+/,Fe="undefined"!=typeof H.createElement(U).style.transition,Xe=Math.min,Se=Math.max,Ve=Math.abs,Ne=Math.sqrt,Ce=Math.round,Pe=Object.prototype,Ae=Pe.toString,Re=Pe.hasOwnProperty,We=Array.prototype.slice;O.prototype={constructor:O,init:function(){var t=this,i=t.options,n=t.element,a="img"===n.tagName.toLowerCase(),o=a?[n]:V(n,"img"),r=o.length,s=v(t.ready,t);E(n,U)||(D(n,U,t),r&&(l(i.ready)&&L(n,be,i.ready,!0),Fe||(i.transition=!1),t.isImg=a,t.length=r,t.count=0,t.images=o,t.body=H.body,t.scrollbarWidth=e.innerWidth-H.body.clientWidth,i.inline?(L(n,be,function(){t.view()},!0),h(o,function(e){e.complete?s():L(e,ve,s,!0)})):L(n,we,t._start=v(t.start,t))))},ready:function(){var e=this;e.count++,e.count===e.length&&e.build()},build:function(){var e,t,i,n,a,o,r,s,l=this,u=l.options,c=l.element;l.isBuilt||(e=H.createElement("div"),e.innerHTML=O.TEMPLATE,l.parent=t=c.parentNode,l.viewer=i=N(e,"viewer-container")[0],l.canvas=N(i,"viewer-canvas")[0],l.footer=N(i,"viewer-footer")[0],l.title=r=N(i,"viewer-title")[0],l.toolbar=a=N(i,"viewer-toolbar")[0],l.navbar=o=N(i,"viewer-navbar")[0],l.button=n=N(i,"viewer-button")[0],l.tooltipBox=N(i,"viewer-tooltip")[0],l.player=N(i,"viewer-player")[0],l.list=N(i,"viewer-list")[0],b(r,u.title?B(u.title):G),b(a,u.toolbar?B(u.toolbar):G),b(o,u.navbar?B(u.navbar):G),x(n,G,!u.button),x(a.querySelector(".viewer-one-to-one"),oe,!u.zoomable),x(a.querySelectorAll('li[class*="zoom"]'),oe,!u.zoomable),x(a.querySelectorAll('li[class*="flip"]'),oe,!u.scalable),u.rotatable||(s=a.querySelectorAll('li[class*="rotate"]'),b(s,oe),C(a,s)),u.inline?(b(n,se),g(i,{zIndex:u.zIndexInline}),"static"===w(t).position&&g(t,{position:"relative"})):(b(n,ue),b(i,Z),b(i,te),b(i,G),g(i,{zIndex:u.zIndex})),t.insertBefore(i,c.nextSibling),u.inline&&(l.render(),l.bind(),l.isShown=!0),l.isBuilt=!0,k(c,be))},unbuild:function(){var e=this;e.isBuilt&&(e.isBuilt=!1,P(e.viewer))},bind:function(){var t=this,i=t.options,n=t.element,a=t.viewer;l(i.view)&&L(n,De,i.view),l(i.viewed)&&L(n,Ie,i.viewed),L(a,we,t._click=v(t.click,t)),L(a,he,t._wheel=v(t.wheel,t)),L(t.canvas,ce,t._mousedown=v(t.mousedown,t)),L(H,de,t._mousemove=v(t.mousemove,t)),L(H,me,t._mouseup=v(t.mouseup,t)),L(H,ge,t._keydown=v(t.keydown,t)),L(e,pe,t._resize=v(t.resize,t))},unbind:function(){var t=this,i=t.options,n=t.element,a=t.viewer;l(i.view)&&Y(n,De,i.view),l(i.viewed)&&Y(n,Ie,i.viewed),Y(a,we,t._click),Y(a,he,t._wheel),Y(t.canvas,ce,t._mousedown),Y(H,de,t._mousemove),Y(H,me,t._mouseup),Y(H,ge,t._keydown),Y(e,pe,t._resize)},render:function(){var e=this;e.initContainer(),e.initViewer(),e.initList(),e.renderViewer()},initContainer:function(){var t=this;t.containerData={width:e.innerWidth,height:e.innerHeight}},initViewer:function(){var e,t=this,i=t.options,n=t.parent;i.inline&&(t.parentData=e={width:Se(n.offsetWidth,i.minWidth),height:Se(n.offsetHeight,i.minHeight)}),!t.isFulled&&e||(e=t.containerData),t.viewerData=f({},e)},renderViewer:function(){var e=this;e.options.inline&&!e.isFulled&&g(e.viewer,e.viewerData)},initList:function(){var e=this,t=e.options,i=e.element,a=e.list,o=[];h(e.images,function(e,i){var a=e.src,r=e.alt||_(a),s=t.url;a&&(n(s)?s=e.getAttribute(s):l(s)&&(s=s.call(e,e)),o.push('<li><img src="'+a+'" data-action="view" data-index="'+i+'" data-original-url="'+(s||a)+'" alt="'+r+'"></li>'))}),a.innerHTML=o.join(""),h(V(a,"img"),function(t){D(t,"filled",!0),L(t,ve,v(e.loadImage,e),!0)}),e.items=V(a,"li"),t.transition&&L(i,Ie,function(){b(a,re)},!0)},renderList:function(e){var t=this,i=e||t.index,n=t.items[i].offsetWidth||30,a=n+1;g(t.list,{width:a*t.length,marginLeft:(t.viewerData.width-n)/2-a*i})},resetList:function(){var e=this;A(e.list),y(e.list,re),g({marginLeft:0})},initImage:function(e){var t=this,i=t.options,n=t.image,a=t.viewerData,o=t.footer.offsetHeight,r=a.width,s=Se(a.height-o,o),u=t.imageData||{};q(n,function(n,a){var o,c,d=n/a,m=r,h=s;s*d>r?h=r/d:m=s*d,m=Xe(.9*m,n),h=Xe(.9*h,a),c={naturalWidth:n,naturalHeight:a,aspectRatio:d,ratio:m/n,width:m,height:h,left:(r-m)/2,top:(s-h)/2},o=f({},c),i.rotatable&&(c.rotate=u.rotate||0,o.rotate=0),i.scalable&&(c.scaleX=u.scaleX||1,c.scaleY=u.scaleY||1,o.scaleX=1,o.scaleY=1),t.imageData=c,t.initialImageData=o,l(e)&&e()})},renderImage:function(e){var t=this,i=t.image,n=t.imageData,a=M(n);g(i,{width:n.width,height:n.height,marginLeft:n.left,marginTop:n.top,WebkitTransform:a,msTransform:a,transform:a}),l(e)&&(t.transitioning?L(i,fe,e,!0):e())},resetImage:function(){var e=this;e.image&&(P(e.image),e.image=null)},start:function(e){var t=this,i=F(e),n=i.target;"img"===n.tagName.toLowerCase()&&(t.target=n,t.show())},click:function(e){var t=this,i=F(e),n=i.target,a=E(n,"action"),o=t.imageData;switch(a){case"mix":t.isPlayed?t.stop():t.options.inline?t.isFulled?t.exit():t.full():t.hide();break;case"view":t.view(E(n,"index"));break;case"zoom-in":t.zoom(.1,!0);break;case"zoom-out":t.zoom(-.1,!0);break;case"one-to-one":t.toggle();break;case"reset":t.reset();break;case"prev":t.prev();break;case"play":t.play();break;case"next":t.next();break;case"rotate-left":t.rotate(-90);break;case"rotate-right":t.rotate(90);break;case"flip-horizontal":t.scaleX(-o.scaleX||-1);break;case"flip-vertical":t.scaleY(-o.scaleY||-1);break;default:t.isPlayed&&t.stop()}},load:function(){var e=this,t=e.options,i=e.image,n=e.index,a=e.viewerData;e.timeout&&(clearTimeout(e.timeout),e.timeout=!1),y(i,oe),i.style.cssText="width:0;height:0;margin-left:"+a.width/2+"px;margin-top:"+a.height/2+"px;max-width:none!important;visibility:visible;",e.initImage(function(){x(i,re,t.transition),x(i,ne,t.movable),e.renderImage(function(){e.isViewed=!0,k(e.element,Ie,{originalImage:e.images[n],index:n,image:i})})})},loadImage:function(e){var t=F(e),i=t.target,n=i.parentNode,a=n.offsetWidth||30,o=n.offsetHeight||50,r=!!E(i,"filled");q(i,function(e,t){var n=e/t,s=a,l=o;o*n>a?r?s=o*n:l=a/n:r?l=a/n:s=o*n,g(i,{width:s,height:l,marginLeft:(a-s)/2,marginTop:(o-l)/2})})},resize:function(){var e=this;e.initContainer(),e.initViewer(),e.renderViewer(),e.renderList(),e.isViewed&&e.initImage(function(){e.renderImage()}),e.isPlayed&&h(V(e.player,"img"),function(t){L(t,ve,v(e.loadImage,e),!0),k(t,ve)})},wheel:function(e){var t=this,i=F(e),n=Number(t.options.zoomRatio)||.1,a=1;t.isViewed&&(T(i),t.wheeling||(t.wheeling=!0,setTimeout(function(){t.wheeling=!1},50),i.deltaY?a=i.deltaY>0?1:-1:i.wheelDelta?a=-i.wheelDelta/120:i.detail&&(a=i.detail>0?1:-1),t.zoom(-a*n,!0,i)))},keydown:function(e){var t=this,i=F(e),n=t.options,a=i.keyCode||i.which||i.charCode;if(t.isFulled&&n.keyboard)switch(a){case 27:t.isPlayed?t.stop():n.inline?t.isFulled&&t.exit():t.hide();break;case 32:t.isPlayed&&t.stop();break;case 37:t.prev();break;case 38:T(i),t.zoom(n.zoomRatio,!0);break;case 39:t.next();break;case 40:T(i),t.zoom(-n.zoomRatio,!0);break;case 48:case 49:(i.ctrlKey||i.shiftKey)&&(T(i),t.toggle())}},mousedown:function(e){var t,i,n=this,a=n.options,o=F(e),r=!!a.movable&&"move",s=o.touches;if(n.isViewed){if(s){if(t=s.length,t>1){if(!a.zoomable||2!==t)return;i=s[1],n.startX2=i.pageX,n.startY2=i.pageY,r="zoom"}else n.isSwitchable()&&(r="switch");i=s[0]}r&&(T(o),n.action=r,n.startX=i?i.pageX:o.pageX,n.startY=i?i.pageY:o.pageY)}},mousemove:function(e){var t,i,n=this,a=n.options,o=F(e),r=n.action,s=n.image,l=o.touches;if(n.isViewed){if(l){if(t=l.length,t>1){if(!a.zoomable||2!==t)return;i=l[1],n.endX2=i.pageX,n.endY2=i.pageY}i=l[0]}r&&(T(o),"move"===r&&a.transition&&p(s,re)&&y(s,re),n.endX=i?i.pageX:o.pageX,n.endY=i?i.pageY:o.pageY,n.change(o))}},mouseup:function(e){var t=this,i=F(e),n=t.action;n&&(T(i),"move"===n&&t.options.transition&&b(t.image,re),t.action=!1)},show:function(){var e,t=this,i=t.options,n=t.element;return i.inline||t.transitioning?t:(t.isBuilt||t.build(),e=t.viewer,l(i.show)&&L(n,ye,i.show,!0),k(n,ye)===!1?t:(t.open(),y(e,G),L(n,xe,function(){t.view(t.target?d(t.target,c(t.images)):t.index),t.target=!1},!0),i.transition?(t.transitioning=!0,b(e,re),W(e),L(e,fe,v(t.shown,t),!0),b(e,ie)):(b(e,ie),t.shown()),t))},hide:function(){var e=this,t=e.options,i=e.element,n=e.viewer;return t.inline||e.transitioning||!e.isShown?e:(l(t.hide)&&L(i,ze,t.hide,!0),k(i,ze)===!1?e:(e.isViewed&&t.transition?(e.transitioning=!0,L(e.image,fe,function(){L(n,fe,v(e.hidden,e),!0),y(n,ie)},!0),e.zoomTo(0,!1,!1,!0)):(y(n,ie),e.hidden()),e))},view:function(e){var t,i,n,a,o,r=this,s=r.element,l=r.title,u=r.canvas;return e=Number(e)||0,!r.isShown||r.isPlayed||e<0||e>=r.length||r.isViewed&&e===r.index?r:(i=r.items[e],n=V(i,"img")[0],a=E(n,"originalUrl"),o=n.getAttribute("alt"),t=H.createElement("img"),t.src=a,t.alt=o,k(s,De,{originalImage:r.images[e],index:e,image:t})===!1?r:(r.image=t,r.isViewed&&y(r.items[r.index],ae),b(i,ae),r.isViewed=!1,r.index=e,r.imageData=null,b(t,oe),A(u),C(u,t),r.renderList(),A(l),L(s,Ie,function(){var e=r.imageData,t=e.naturalWidth,i=e.naturalHeight;R(l,o+" ("+t+" × "+i+")")},!0),t.complete?r.load():(L(t,ve,v(r.load,r),!0),r.timeout&&clearTimeout(r.timeout),r.timeout=setTimeout(function(){y(t,oe),r.timeout=!1},1e3)),r))},prev:function(){var e=this;return e.view(Se(e.index-1,0)),e},next:function(){var e=this;return e.view(Xe(e.index+1,e.length-1)),e},move:function(e,t){var i=this,n=i.imageData;return i.moveTo(o(e)?e:n.left+Number(e),o(t)?t:n.top+Number(t)),i},moveTo:function(e,t){var i=this,n=i.imageData,r=!1;return o(t)&&(t=e),e=Number(e),t=Number(t),i.isViewed&&!i.isPlayed&&i.options.movable&&(a(e)&&(n.left=e,r=!0),a(t)&&(n.top=t,r=!0),r&&i.renderImage()),i},zoom:function(e,t,i){var n=this,a=n.imageData;return e=Number(e),e=e<0?1/(1-e):1+e,n.zoomTo(a.width*e/a.naturalWidth,t,i),n},zoomTo:function(e,t,i,n){var o,r,s,l,u=this,c=u.options,d=.01,m=100,h=u.imageData;return e=Se(0,e),a(e)&&u.isViewed&&!u.isPlayed&&(n||c.zoomable)&&(n||(d=Se(d,c.minZoomRatio),m=Xe(m,c.maxZoomRatio),e=Xe(Se(e,d),m)),e>.95&&e<1.05&&(e=1),o=h.naturalWidth*e,r=h.naturalHeight*e,i?(s=X(u.viewer),l=i.touches?S(i.touches):{pageX:i.pageX,pageY:i.pageY},h.left-=(o-h.width)*((l.pageX-s.left-h.left)/h.width),h.top-=(r-h.height)*((l.pageY-s.top-h.top)/h.height)):(h.left-=(o-h.width)/2,h.top-=(r-h.height)/2),h.width=o,h.height=r,h.ratio=e,u.renderImage(),t&&u.tooltip()),u},rotate:function(e){var t=this;return t.rotateTo((t.imageData.rotate||0)+Number(e)),t},rotateTo:function(e){var t=this,i=t.imageData;return e=Number(e),a(e)&&t.isViewed&&!t.isPlayed&&t.options.rotatable&&(i.rotate=e,t.renderImage()),t},scale:function(e,t){var i=this,n=i.imageData,r=!1;return o(t)&&(t=e),e=Number(e),t=Number(t),i.isViewed&&!i.isPlayed&&i.options.scalable&&(a(e)&&(n.scaleX=e,r=!0),a(t)&&(n.scaleY=t,r=!0),r&&i.renderImage()),i},scaleX:function(e){var t=this;return t.scale(e,t.imageData.scaleY),t},scaleY:function(e){var t=this;return t.scale(t.imageData.scaleX,e),t},play:function(){var e,t=this,i=t.options,n=t.player,o=v(t.loadImage,t),r=[],s=0,l=0;return!t.isShown||t.isPlayed?t:(i.fullscreen&&t.requestFullscreen(),t.isPlayed=!0,b(n,K),h(t.items,function(e,t){var a=V(e,"img")[0],u=H.createElement("img");u.src=E(a,"originalUrl"),u.alt=a.getAttribute("alt"),s++,b(u,te),x(u,re,i.transition),p(e,ae)&&(b(u,ie),l=t),r.push(u),L(u,ve,o,!0),C(n,u)}),a(i.interval)&&i.interval>0&&(e=function(){t.playing=setTimeout(function(){y(r[l],ie),l++,l=l<s?l:0,b(r[l],ie),e()},i.interval)},s>1&&e()),t)},stop:function(){var e=this,t=e.player;return e.isPlayed?(e.options.fullscreen&&e.exitFullscreen(),e.isPlayed=!1,clearTimeout(e.playing),y(t,K),A(t),e):e},full:function(){var e=this,t=e.options,i=e.viewer,n=e.image,a=e.list;return!e.isShown||e.isPlayed||e.isFulled||!t.inline?e:(e.isFulled=!0,e.open(),b(e.button,le),t.transition&&(y(n,re),y(a,re)),b(i,Z),i.setAttribute("style",""),g(i,{zIndex:t.zIndex}),e.initContainer(),e.viewerData=f({},e.containerData),e.renderList(),e.initImage(function(){e.renderImage(function(){t.transition&&setTimeout(function(){b(n,re),b(a,re)},0)})}),e)},exit:function(){var e=this,t=e.options,i=e.viewer,n=e.image,a=e.list;return e.isFulled?(e.isFulled=!1,e.close(),y(e.button,le),t.transition&&(y(n,re),y(a,re)),y(i,Z),g(i,{zIndex:t.zIndexInline}),e.viewerData=f({},e.parentData),e.renderViewer(),e.renderList(),e.initImage(function(){e.renderImage(function(){t.transition&&setTimeout(function(){b(n,re),b(a,re)},0)})}),e):e},tooltip:function(){var e=this,t=e.options,i=e.tooltipBox,n=e.imageData;return e.isViewed&&!e.isPlayed&&t.tooltip?(R(i,Ce(100*n.ratio)+"%"),e.tooltiping?clearTimeout(e.tooltiping):t.transition?(e.fading&&k(i,fe),b(i,K),b(i,te),b(i,re),W(i),b(i,ie)):b(i,K),e.tooltiping=setTimeout(function(){t.transition?(L(i,fe,function(){y(i,K),y(i,te),y(i,re),e.fading=!1},!0),y(i,ie),e.fading=!0):y(i,K),e.tooltiping=!1},1e3),e):e},toggle:function(){var e=this;return 1===e.imageData.ratio?e.zoomTo(e.initialImageData.ratio,!0):e.zoomTo(1,!0),e},reset:function(){var e=this;return e.isViewed&&!e.isPlayed&&(e.imageData=f({},e.initialImageData),e.renderImage()),e},update:function(){var e,t=this,i=[];return t.isImg&&!t.element.parentNode?t.destroy():(t.length=t.images.length,t.isBuilt&&(h(t.items,function(e,n){var a=V(e,"img")[0],o=t.images[n];o?o.src!==a.src&&i.push(n):i.push(n)}),g(t.list,{width:"auto"}),t.initList(),t.isShown&&(t.length?t.isViewed&&(e=d(t.index,i),e>=0?(t.isViewed=!1,t.view(Se(t.index-(e+1),0))):b(t.items[t.index],ae)):(t.image=null,t.isViewed=!1,t.index=0,t.imageData=null,A(t.canvas),A(t.title)))),t)},destroy:function(){var e=this,t=e.element;return e.options.inline?e.unbind():(e.isShown&&e.unbind(),Y(t,we,e._start)),e.unbuild(),I(t,U),e},open:function(){var e=this.body;b(e,$),e.style.paddingRight=this.scrollbarWidth+"px"},close:function(){var e=this.body;y(e,$),e.style.paddingRight=0},shown:function(){var e=this,t=e.options,i=e.element;e.transitioning=!1,e.isFulled=!0,e.isShown=!0,e.isVisible=!0,e.render(),e.bind(),l(t.shown)&&L(i,xe,t.shown,!0),k(i,xe)},hidden:function(){var e=this,t=e.options,i=e.element;e.transitioning=!1,e.isViewed=!1,e.isFulled=!1,e.isShown=!1,e.isVisible=!1,e.unbind(),e.close(),b(e.viewer,G),e.resetList(),e.resetImage(),l(t.hidden)&&L(i,Ee,t.hidden,!0),k(i,Ee)},requestFullscreen:function(){var e=this,t=H.documentElement;!e.isFulled||H.fullscreenElement||H.mozFullScreenElement||H.webkitFullscreenElement||H.msFullscreenElement||(t.requestFullscreen?t.requestFullscreen():t.msRequestFullscreen?t.msRequestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT))},exitFullscreen:function(){var e=this;e.isFulled&&(H.exitFullscreen?H.exitFullscreen():H.msExitFullscreen?H.msExitFullscreen():H.mozCancelFullScreen?H.mozCancelFullScreen():H.webkitExitFullscreen&&H.webkitExitFullscreen())},change:function(e){var t=this,i=t.endX-t.startX,n=t.endY-t.startY;switch(t.action){case"move":t.move(i,n);break;case"zoom":t.zoom(function(e,t,i,n){var a=Ne(e*e+t*t),o=Ne(i*i+n*n);return(o-a)/a}(Ve(t.startX-t.startX2),Ve(t.startY-t.startY2),Ve(t.endX-t.endX2),Ve(t.endY-t.endY2)),!1,e),t.startX2=t.endX2,t.startY2=t.endY2;break;case"switch":t.action="switched",Ve(i)>Ve(n)&&(i>1?t.prev():i<-1&&t.next())}t.startX=t.endX,t.startY=t.endY},isSwitchable:function(){var e=this,t=e.imageData,i=e.viewerData;return t.left>=0&&t.top>=0&&t.width<=i.width&&t.height<=i.height}},O.DEFAULTS={inline:!1,button:!0,navbar:!0,title:!0,toolbar:!0,tooltip:!0,movable:!0,zoomable:!0,rotatable:!0,scalable:!0,transition:!0,fullscreen:!0,keyboard:!0,interval:5e3,minWidth:200,minHeight:100,zoomRatio:.1,minZoomRatio:.01,maxZoomRatio:100,zIndex:2015,zIndexInline:0,url:"src",build:null,built:null,show:null,shown:null,hide:null,hidden:null,view:null,viewed:null},O.TEMPLATE='<div class="viewer-container"><div class="viewer-canvas"></div><div class="viewer-footer"><div class="viewer-title"></div><ul class="viewer-toolbar"><li class="viewer-zoom-in" data-action="zoom-in"></li><li class="viewer-zoom-out" data-action="zoom-out"></li><li class="viewer-one-to-one" data-action="one-to-one"></li><li class="viewer-reset" data-action="reset"></li><li class="viewer-prev" data-action="prev"></li><li class="viewer-play" data-action="play"></li><li class="viewer-next" data-action="next"></li><li class="viewer-rotate-left" data-action="rotate-left"></li><li class="viewer-rotate-right" data-action="rotate-right"></li><li class="viewer-flip-horizontal" data-action="flip-horizontal"></li><li class="viewer-flip-vertical" data-action="flip-vertical"></li></ul><div class="viewer-navbar"><ul class="viewer-list"></ul></div></div><div class="viewer-tooltip"></div><div class="viewer-button" data-action="mix"></div><div class="viewer-player"></div></div>';var _e=e.Viewer;return O.noConflict=function(){return e.Viewer=_e,O},O.setDefaults=function(e){f(O.DEFAULTS,e)},"function"==typeof define&&define.amd&&define("viewer",[],function(){return O}),t||(e.Viewer=O),O});
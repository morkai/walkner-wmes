!function(e,n){"use strict";"undefined"!=typeof Element&&Element;var l=function(){for(var e,l,r=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],t=0,u=r.length,c={};t<u;t++)if((e=r[t])&&e[1]in n){for(t=0,l=e.length;t<l;t++)c[r[0][t]]=e[t];return c}return!1}(),r={request:function(e){var r=l.requestFullscreen;e=e||n.documentElement,/5\.1[\.\d]* Safari/.test(navigator.userAgent)?e[r]():(console.log(e,r,arguments),e[r]())},exit:function(){n[l.exitFullscreen]()},toggle:function(e){this.isFullscreen?this.exit():this.request(e)},onchange:function(){},onerror:function(){},raw:l};l?(Object.defineProperties(r,{isFullscreen:{get:function(){return!!n[l.fullscreenElement]}},element:{enumerable:!0,get:function(){return n[l.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return!!n[l.fullscreenEnabled]}}}),n.addEventListener(l.fullscreenchange,function(e){r.onchange.call(r,e)}),n.addEventListener(l.fullscreenerror,function(e){r.onerror.call(r,e)}),e.screenfull=r):e.screenfull=!1}(window,document);
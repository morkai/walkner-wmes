!function(e,n){"use strict";var l="undefined"!=typeof Element&&"ALLOW_KEYBOARD_INPUT"in Element,r=function(){for(var e,l,r=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],t=0,u=r.length,c={};t<u;t++)if(e=r[t],e&&e[1]in n){for(t=0,l=e.length;t<l;t++)c[r[0][t]]=e[t];return c}return!1}(),t={request:function(e){var t=r.requestFullscreen;e=e||n.documentElement,/5\.1[\.\d]* Safari/.test(navigator.userAgent)?e[t]():e[t](l&&Element.ALLOW_KEYBOARD_INPUT)},exit:function(){n[r.exitFullscreen]()},toggle:function(e){this.isFullscreen?this.exit():this.request(e)},onchange:function(){},onerror:function(){},raw:r};return r?(Object.defineProperties(t,{isFullscreen:{get:function(){return!!n[r.fullscreenElement]}},element:{enumerable:!0,get:function(){return n[r.fullscreenElement]}},enabled:{enumerable:!0,get:function(){return!!n[r.fullscreenEnabled]}}}),n.addEventListener(r.fullscreenchange,function(e){t.onchange.call(t,e)}),n.addEventListener(r.fullscreenerror,function(e){t.onerror.call(t,e)}),void(e.screenfull=t)):void(e.screenfull=!1)}(window,document);
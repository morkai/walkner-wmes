// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";function e(t){var o=t.data;"localStorage"===o.type&&(window.removeEventListener("message",e),r=o.data,0===Object.keys(r).length&&(Object.keys(localStorage).forEach(function(e){r[e]=localStorage[e]}),window.parent.postMessage({type:"localStorage",action:"write",data:r},"*")),l&&(clearTimeout(l),l=null),a&&(a(),a=null))}function t(e,t){r[e]=t,window.parent.postMessage({type:"localStorage",action:"setItem",key:e,value:t},"*")}function o(e){delete r[e],window.parent.postMessage({type:"localStorage",action:"removeItem",key:e},"*")}function n(){window.parent.postMessage({type:"localStorage",action:"clear"},"*")}var a=null,l=null,r=null;return window.addEventListener("message",e),{start:function(t){if(r)return t();if(a){var o=a;return void(a=function(){o(),t()})}a=t,l=setTimeout(function(){a(),window.removeEventListener("message",e),a=null,l=null},333),window.parent.postMessage({type:"localStorage",action:"read"},"*")},getItem:function(e){var t=(r?r:localStorage)[e];return void 0===t?null:t},setItem:function(e,o){r?t(e,o):localStorage.setItem(e,o)},removeItem:function(e){r?o(e):localStorage.removeItem(e)},clear:function(){r?n():localStorage.clear()}}});
// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var r="function"==typeof Number.prototype.toLocaleString?"toLocaleString":"toString";return{parse:function(r,t){if(!r)return 0;var e=parseFloat(r.replace(",",".").replace(/[^0-9.\-]+/g,""));return isNaN(e)||!t&&e<0?0:e},round:function(t){return(Math.round(1e4*t)/1e4)[r]()}}});
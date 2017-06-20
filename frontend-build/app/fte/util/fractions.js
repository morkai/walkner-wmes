// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var r="function"==typeof Number.prototype.toLocaleString?"toLocaleString":"toString";return{parse:function(r){var t=parseFloat(r.replace(",",".").replace(/[^0-9\.]+/g,""));return isNaN(t)||t<0?0:t},round:function(t){return(Math.round(1e4*t)/1e4)[r]()}}});
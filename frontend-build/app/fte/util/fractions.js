// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";var r="function"==typeof Number.prototype.toLocaleString?"toLocaleString":"toString";return{parse:function(r){var t=parseFloat(r.replace(",",".").replace(/[^0-9\.]+/g,""));return isNaN(t)||0>t?0:t},round:function(t){return(Math.round(1e4*t)/1e4)[r]()}}});
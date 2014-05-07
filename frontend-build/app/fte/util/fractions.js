// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){var r="function"==typeof Number.prototype.toLocaleString?"toLocaleString":"toString";return{parse:function(r){var e=parseFloat(r.replace(",",".").replace(/[^0-9\.]+/g,""));return isNaN(e)||0>e?0:e},round:function(e){return(Math.round(1e4*e)/1e4)[r]()}}});
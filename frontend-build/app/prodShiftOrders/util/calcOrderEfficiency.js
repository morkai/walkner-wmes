// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){return function(n,t){var r=n.laborTime/100*n.totalQuantity/(n.workDuration*n.workerCount);return r=isNaN(r)||!isFinite(r)?0:r,t?Math.round(100*r)+"%":r}});
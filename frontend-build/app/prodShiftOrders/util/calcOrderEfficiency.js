// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";return function(t,n){var r=t.laborTime/100*t.totalQuantity/(t.workDuration*t.workerCount);return r=isNaN(r)||!isFinite(r)?0:r,n?Math.round(100*r)+"%":r}});
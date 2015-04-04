// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";return function(t,n){var r=t.laborTime/100*t.totalQuantity/(t.workDuration*t.workerCount);return r=isNaN(r)||!isFinite(r)?0:r,n?Math.round(100*r)+"%":r}});
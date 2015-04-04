// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";var e={};return{getCategory:function(n,t){return"undefined"==typeof e[n]&&(e[n]={counter:0,assigned:{}}),n=e[n],"string"!=typeof n.assigned[t]&&(n.assigned[t]=n.counter.toString(36).toUpperCase(),n.counter+=1),n.assigned[t]}}});
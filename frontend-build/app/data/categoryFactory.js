// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var e={};return{getCategory:function(n,t){return"undefined"==typeof e[n]&&(e[n]={counter:0,assigned:{}}),n=e[n],"string"!=typeof n.assigned[t]&&(n.assigned[t]=n.counter.toString(36).toUpperCase(),n.counter+=1),n.assigned[t]}}});
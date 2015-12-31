// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var n=30;return function(t){if(n+5>t)return t;var e=t.split(" "),r=[];return e.forEach(function(t){var e=0===r.length?"":r[r.length-1];0===r.length||e.length+t.length>n?r.push(t):r[r.length-1]+=" "+t}),r.join("<br>")}});
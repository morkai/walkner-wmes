// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";var n=30;return function(t){if(n+5>t)return t;var e=t.split(" "),r=[];return e.forEach(function(t){var e=0===r.length?"":r[r.length-1];0===r.length||e.length+t.length>n?r.push(t):r[r.length-1]+=" "+t}),r.join("<br>")}});
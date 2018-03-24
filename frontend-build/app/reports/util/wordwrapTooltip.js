// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";return function(n){if(n<35)return n;var t=n.split(" "),e=[];return t.forEach(function(n){var t=0===e.length?"":e[e.length-1];0===e.length||t.length+n.length>30?e.push(n):e[e.length-1]+=" "+n}),e.join("<br>")}});
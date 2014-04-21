// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){return function(n){if(45>n)return n;var t=n.split(" "),e=[];return t.forEach(function(n){var t=0===e.length?"":e[e.length-1];0===e.length||t.length+n.length>40?e.push(n):e[e.length-1]+=" "+n}),e.join('</span><br><span style="font-size: 10px">')}});
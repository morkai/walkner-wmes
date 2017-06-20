// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(r){"use strict";var t=/^[A-Z0-9]{6}/;return function(i){if(!i)return"";var e=i.description||"",n=i.name||"";return r.isEmpty(e)?n.trim():r.isEmpty(n)?e.trim():t.test(n)?n.trim():(e||n).trim()}});
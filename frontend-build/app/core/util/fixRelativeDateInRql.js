// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time","./getRelativeDateRange"],function(r,e){"use strict";return function(t,a){if(!t||!t.selector)return t;var o=[];return t.selector.args.forEach(function(t){if("eq"!==t.name||t.args[0]!==a.property)return void o.push(t);var f=e(t.args[1],a.shift);return f?void(a.range?(o.push({name:"ge",args:[a.property,a.format?r.format(f.from,a.format):f.from.valueOf()]}),o.push({name:"lt",args:[a.property,a.format?r.format(f.to,a.format):f.to.valueOf()]})):o.push({name:"eq",args:[a.property,a.format?r.format(f.from,a.format):f.from.valueOf()]})):void o.push(t)}),t.selector.args=o,t}});
// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(e){"use strict";return function(n,r){var t=e.find(n.selector.args,function(e){return"eq"===e.name&&"type"===e.args[0]});return!t||r.indexOf(t.args[1])!==-1}});
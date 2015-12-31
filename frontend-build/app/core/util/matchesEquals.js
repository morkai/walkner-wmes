// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(r){"use strict";return function(n,e,t){var u=r.find(n.selector.args,function(r){return"eq"===r.name&&r.args[0]===e});return!u||u.args[1]===t}});
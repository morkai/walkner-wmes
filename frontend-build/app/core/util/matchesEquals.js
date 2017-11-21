// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore"],function(r){"use strict";return function(n,e,i){if(void 0===i)return!0;var t=r.find(n.selector.args,function(r){return("eq"===r.name||"in"===r.name)&&r.args[0]===e});return!t||("eq"===t.args[0]?t.args[1]===i:t.args[1].indexOf(i)!==-1)}});
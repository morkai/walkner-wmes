define(["underscore"],function(n){return function(e,r){var t=n.find(e.selector.args,function(n){return"eq"===n.name&&"type"===n.args[0]});return t?-1!==r.indexOf(t.args[1]):!0}});
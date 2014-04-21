// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore"],function(n){return function(e,r){var t=n.find(e.selector.args,function(n){return"eq"===n.name&&"type"===n.args[0]});return t?-1!==r.indexOf(t.args[1]):!0}});
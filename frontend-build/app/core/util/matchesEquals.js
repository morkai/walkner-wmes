// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore"],function(r){"use strict";return function(n,e,t){var u=r.find(n.selector.args,function(r){return"eq"===r.name&&r.args[0]===e});return!u||u.args[1]===t}});
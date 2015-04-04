// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore"],function(e){"use strict";return function(n,r){var t=e.find(n.selector.args,function(e){return"eq"===e.name&&"type"===e.args[0]});return t?-1!==r.indexOf(t.args[1]):!0}});
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time"],function(t){"use strict";return function(r,e){var u=t.getMoment(r);return 1===e?u.hours(6):2===e?u.hours(14):u.hours(22),u.add(8,"hours").subtract(1,"seconds"),u.toDate()}});
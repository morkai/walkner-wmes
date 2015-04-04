// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time"],function(t){"use strict";return function(s){var e=t.getMoment(s),n=e.hour(),r=-1;return n>=6&&14>n?(e.hours(6),r=1):n>=14&&22>n?(e.hours(14),r=2):(e.hours(22),6>n&&e.subtract(1,"days"),r=3),{moment:e.minutes(0).seconds(0).milliseconds(0),shift:r}}});
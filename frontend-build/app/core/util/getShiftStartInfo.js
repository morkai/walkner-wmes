// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time"],function(t){"use strict";return function(s){var e=t.getMoment(s),n=e.hour(),r=-1;return n>=6&&14>n?(e.hours(6),r=1):n>=14&&22>n?(e.hours(14),r=2):(e.hours(22),6>n&&e.subtract(1,"days"),r=3),{moment:e.minutes(0).seconds(0).milliseconds(0),shift:r}}});
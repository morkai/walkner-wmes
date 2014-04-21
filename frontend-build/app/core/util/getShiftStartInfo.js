// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time"],function(n){return function(t){var e=n.getMoment(t),s=e.hour(),o=-1;return s>=6&&14>s?(e.hours(6),o=1):s>=14&&22>s?(e.hours(14),o=2):(e.hours(22),6>s&&e.subtract("days",1),o=3),{moment:e.minutes(0).seconds(0).milliseconds(0),shift:o}}});
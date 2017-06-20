// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time"],function(t){"use strict";return function(r,e){var u=t.getMoment(r);return 1===e?u.hours(6):2===e?u.hours(14):u.hours(22),u.add(8,"hours").subtract(1,"seconds"),u.toDate()}});
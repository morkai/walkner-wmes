// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/time"],function(e){"use strict";return function(t){var s=e.getMoment().hours(6).minutes(0).seconds(0).milliseconds(0);switch(t){case"year":case"quarter":case"month":case"week":s.startOf(t)}return s.valueOf()}});
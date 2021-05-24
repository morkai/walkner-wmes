// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'i18n!app/nls/orgUnits'
], function(
  t,
  time
) {
  'use strict';

  return function changeWarning(view)
  {
    var moment = time.getMoment();
    var h = moment.hours();
    var m = moment.hours();
    var d = moment.day();
    var shift3 = (h > 23) || (h >= 22 && m >= 15) || (h < 5) || (h <= 5 && m <= 45);
    var weekend = d === 0 || d === 6;
    var warn = !(shift3 || weekend);

    if (warn)
    {
      view.$('.panel-body').prepend(
        '<div class="message message-inline message-warning" style="margin-bottom: 15px">'
        + t('orgUnits', 'changeWarning')
        + '</div>'
      );
    }
  };
});

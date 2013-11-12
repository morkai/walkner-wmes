define([
  'moment',
  'reltime'
], function(
  moment,
  reltime
) {
  'use strict';

  return function fixTimeRange($from, $to, format)
  {
    var timeRange = {from: -1, to: -1};
    var fromValue = $from.val().trim();
    var toValue = $to.val().trim();
    var now = new Date();
    var fromMoment = moment(fromValue);
    var toMoment = moment(toValue);

    if (!fromMoment.isValid() && fromValue.length > 0)
    {
      var fromReltime = reltime.parse(now, fromValue);

      if (fromReltime !== false)
      {
        fromMoment = moment(fromReltime);
      }
    }

    if (!toMoment.isValid() && toValue.length > 0)
    {
      var toReltime = reltime.parse(now, toValue);

      if (toReltime !== false)
      {
        toMoment = moment(toReltime);
      }
    }

    if (fromMoment.isValid())
    {
      $from.val(fromMoment.format(format));

      timeRange.from = fromMoment.valueOf();
    }
    else
    {
      $from.val('');
    }

    if (toMoment.isValid())
    {
      if (fromMoment.valueOf() === toMoment.valueOf())
      {
        toMoment.add('days', 1);
      }

      $to.val(toMoment.format(format));

      timeRange.to = toMoment.valueOf();
    }
    else
    {
      $to.val('');
    }

    return timeRange;
  };
});

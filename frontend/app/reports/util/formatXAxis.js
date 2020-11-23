// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/planning/util/shift'
],
function(
  t,
  time,
  shiftUtil
) {
  'use strict';

  function formatXAxis(view, ctx)
  {
    var moment = time.getMoment(ctx.value);
    var online = view.model.query && !view.model.query.get('from') && !view.model.query.get('to');
    var interval;
    var data;

    if (view.interval)
    {
      interval = view.interval;
    }
    else if (view.model.query)
    {
      interval = view.model.query.get('interval');
    }
    else
    {
      interval = view.model.get('interval');
    }

    if (online && interval === 'hour')
    {
      return moment.format('H');
    }
    else if (interval === 'shift')
    {
      var shift = t('core', 'SHIFT:' + shiftUtil.getShiftNo(ctx.value, true));

      if (online)
      {
        return shift;
      }

      data = {
        shift: shift
      };
    }
    else if (interval === 'quarter')
    {
      data = {
        quarter: t('core', 'QUARTER:' + moment.quarter())
      };
    }
    else if (!interval)
    {
      interval = 'day';
    }

    return moment.format(t('reports', 'x:' + interval, data));
  }

  formatXAxis.labels = function(view)
  {
    return {
      formatter: formatXAxis.bind(null, view)
    };
  };

  return formatXAxis;
});

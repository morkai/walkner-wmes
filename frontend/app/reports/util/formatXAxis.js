// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time'
],
function(
  t,
  time
) {
  'use strict';

  function formatXAxis(view, ctx)
  {
    var moment = time.getMoment(ctx.value);
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

    if (interval === 'shift')
    {
      data = {
        shift: t('core', 'SHIFT:' + (moment.hours() === 6 ? 1 : moment.hours() === 14 ? 2 : 3))
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

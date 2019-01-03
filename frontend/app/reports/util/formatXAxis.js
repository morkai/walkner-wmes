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
    var timeMoment = time.getMoment(ctx.value);
    var interval = (view.interval || (view.model.query ? view.model.query.get('interval') : view.model.get('interval')))
      || 'day';
    var data;

    if (interval === 'shift')
    {
      data = {
        shift: t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
      };
    }
    else if (interval === 'quarter')
    {
      data = {
        quarter: t('core', 'QUARTER:' + timeMoment.quarter())
      };
    }

    return timeMoment.format(t('reports', 'x:' + interval, data));
  }

  formatXAxis.labels = function(view)
  {
    return {
      formatter: formatXAxis.bind(null, view)
    };
  };

  return formatXAxis;
});

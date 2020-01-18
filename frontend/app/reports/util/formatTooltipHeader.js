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

  return function formatTooltipHeader(ctx, short)
  {
    var x = 0;

    if (typeof ctx === 'number')
    {
      x = ctx;
    }
    else if (ctx)
    {
      if (typeof ctx.x === 'number')
      {
        x = ctx.x;
      }
      else if (ctx.x
        && ctx.x.name
        && ctx.points
        && ctx.points[0]
        && ctx.points[0].point
        && ctx.points[0].point.time)
      {
        x = ctx.points[0].point.time;
      }
    }

    var timeMoment = time.getMoment(x);
    var interval = (this.model.query ? this.model.query.get('interval') : this.model.get('interval')) || 'day';
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

    return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + (short ? 'short:' : '') + interval, data));
  };
});

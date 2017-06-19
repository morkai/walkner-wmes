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

  return function formatTooltipHeader(ctx)
  {
    var timeMoment = time.getMoment(typeof ctx === 'number' ? ctx : ctx.x);
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

    return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, data));
  };
});

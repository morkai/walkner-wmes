// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
    var interval = this.model.query.get('interval');
    var data;

    if (interval === 'shift')
    {
      data = {
        shift: t('core', 'SHIFT:' + (timeMoment.hours() === 6 ? 1 : timeMoment.hours() === 14 ? 2 : 3))
      };
    }

    return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + interval, data));
  };
});

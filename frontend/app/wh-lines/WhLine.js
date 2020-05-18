// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/planning/util/shift'
], function(
  t,
  time,
  Model,
  shiftUtil
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/lines',

    clientUrlRoot: '#wh/lines',

    topicPrefix: 'old.wh.lines',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-lines',

    defaults: function()
    {
      return {
        pickup: {
          sets: 0,
          qty: 0,
          time: 0
        },
        components: {
          qty: 0,
          time: 0
        },
        packaging: {
          qty: 0,
          time: 0
        },
        redirLine: null,
        nextShiftAt: null,
        startedPlan: null,
        working: false
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      if (obj.nextShiftAt)
      {
        var shiftDate = shiftUtil.getPlanDate(obj.nextShiftAt).format('L');
        var currentDate = shiftUtil.getPlanDate(Date.now(), true).format('L');
        var shiftTime = time.utc.format(obj.nextShiftAt, 'LTS');
        var shiftNo = shiftUtil.getShiftNoFromStartTime(shiftTime);

        if (shiftNo)
        {
          if (shiftDate === currentDate)
          {
            obj.nextShiftAt = t('core', 'SHIFT:' + shiftNo);
          }
          else
          {
            obj.nextShiftAt = t('core', 'SHIFT', {
              date: shiftDate,
              shift: shiftNo
            });
          }
        }
        else if (shiftDate === currentDate)
        {
          obj.nextShiftAt = shiftTime;
        }
        else
        {
          obj.nextShiftAt = shiftDate + ', ' + shiftTime;
        }
      }
      else
      {
        obj.nextShiftAt = '';
      }

      obj.startedPlan = obj.startedPlan && obj.startedPlan !== '1970-01-01T00:00:00.000Z'
        ? time.utc.format(obj.startedPlan, 'L')
        : '';

      return obj;
    }

  });
});

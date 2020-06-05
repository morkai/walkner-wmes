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
          started: {
            sets: 0,
            qty: 0,
            time: 0
          },
          finished: {
            sets: 0,
            qty: 0,
            time: 0
          },
          total: {
            sets: 0,
            qty: 0,
            time: 0
          }
        },
        available: {
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

      obj.nextShiftAt = this.serializeNextShiftAt();

      obj.startedPlan = obj.startedPlan && obj.startedPlan !== '1970-01-01T00:00:00.000Z'
        ? time.utc.format(obj.startedPlan, 'L')
        : '';

      return obj;
    },

    serializeNextShiftAt: function()
    {
      var nextShiftAt = this.get('nextShiftAt');

      if (nextShiftAt)
      {
        var shiftDate = shiftUtil.getPlanDate(nextShiftAt, false).format('L');
        var currentDate = shiftUtil.getPlanDate(Date.now(), true).format('L');
        var shiftTime = time.utc.format(nextShiftAt, 'LTS');
        var shiftNo = shiftUtil.getShiftNoFromStartTime(shiftTime);

        if (shiftNo)
        {
          if (shiftDate === currentDate)
          {
            nextShiftAt = t('core', 'SHIFT:' + shiftNo);
          }
          else
          {
            nextShiftAt = t('core', 'SHIFT', {
              date: shiftDate,
              shift: shiftNo
            });
          }
        }
        else if (shiftDate === currentDate)
        {
          nextShiftAt = shiftTime;
        }
        else
        {
          nextShiftAt = shiftDate + ', ' + shiftTime;
        }
      }
      else
      {
        nextShiftAt = '';
      }

      return nextShiftAt;
    }

  });
});

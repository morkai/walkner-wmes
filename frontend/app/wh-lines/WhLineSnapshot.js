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

    urlRoot: '/old/wh/lineSnapshots',

    clientUrlRoot: '#wh/lineSnapshots',

    topicPrefix: 'old.wh.lineSnapshots',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-lines',

    serialize: function()
    {
      var obj = this.toJSON();

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      Object.keys(obj.data).forEach(function(k)
      {
        if (k === '_id')
        {
          return;
        }

        obj[k] = obj.data[k];
      });

      obj.date = time.format(obj.time, 'L');
      obj.time = time.format(obj.time, 'HH:mm:ss');
      obj.nextShiftAt = this.serializeNextShiftAt();

      if (obj.startedPlan)
      {
        obj.startedPlan = time.utc.format(obj.startedPlan, 'L');
      }

      return obj;
    },

    serializeNextShiftAt: function()
    {
      var nextShiftAt = this.get('data').nextShiftAt;

      if (nextShiftAt)
      {
        var shiftDate = shiftUtil.getPlanDate(nextShiftAt, false).format('L');
        var shiftTime = time.utc.format(nextShiftAt, 'LTS');
        var shiftNo = shiftUtil.getShiftNoFromStartTime(shiftTime);

        if (shiftNo)
        {
          nextShiftAt = t('core', 'SHIFT', {
            date: shiftDate,
            shift: shiftNo
          });
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

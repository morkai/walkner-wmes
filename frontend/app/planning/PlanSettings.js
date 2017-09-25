// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Model'
], function(
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/planning/settings',

    clientUrlRoot: '#planning/settings',

    topicPrefix: 'planning.settings',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    parse: function(res)
    {
      res._id = time.utc.format(res._id, 'YYYY-MM-DD');

      return res;
    },

    getLabel: function()
    {
      return time.utc.format(this.id, 'LL');
    }

  }, {

    forDate: function(date)
    {
      var current = time.utc.getMoment().startOf('day');

      if (/^-?[0-9]+d$/.test(date))
      {
        date = current.add(+date.replace('d', ''), 'days').format('YYYY-MM-DD');
      }

      return new this({_id: date});
    }

  });
});

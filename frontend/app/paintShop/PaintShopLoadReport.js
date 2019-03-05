// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/Model'
], function(
  _,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'paintShop',

    url: '/paintShop/load/report',

    defaults: function()
    {
      var moment = time.getMoment().startOf('today').subtract(13, 'days');

      return {
        from: moment.valueOf(),
        to: moment.add(2, 'weeks').valueOf(),
        interval: 'day'
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
        options.data || {},
        _.pick(this.attributes, ['from', 'to', 'interval'])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/paintShop/load'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval');
    },

    parse: function(res)
    {
      return {
        from: res.options.fromTime,
        to: res.options.toTime,
        interval: res.options.interval,
        groups: res.groups
      };
    }

  });
});

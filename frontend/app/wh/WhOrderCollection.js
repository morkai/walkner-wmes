// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './WhOrder'
], function(
  _,
  time,
  Collection,
  WhOrder
) {
  'use strict';

  function getCurrentDate()
  {
    return time.utc.getMoment(Date.now())
      .startOf('day')
      .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
      .format('YYYY-MM-DD');
  }

  return Collection.extend({

    model: WhOrder,

    paginate: false,

    initialize: function(models, options)
    {
      options = _.assign({date: getCurrentDate()}, options);

      this.date = options.date;
    },

    setCurrentDate: function()
    {
      this.date = getCurrentDate();
    },

    url: function()
    {
      return '/wh/orders'
        + '?sort(group,line,startTime)'
        + '&date=' + time.utc.getMoment(this.date, 'YYYY-MM-DD').valueOf();
    }

  });
});

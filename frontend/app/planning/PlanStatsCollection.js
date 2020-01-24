// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Collection',
  'app/core/util/getShiftStartInfo'
], function(
  time,
  Collection,
  getShiftStartInfo
) {
  'use strict';

  return Collection.extend({

    nlsDomain: 'planning',

    initialize: function(models, options)
    {
      this.month = options && options.month;
    },

    url: function()
    {
      if (!this.month)
      {
        return '/planning/plans';
      }

      var dateRange = this.getDateRange();

      return '/planning/plans'
        + '?select(stats)&sort(_id)&limit(0)'
        + '&_id>=' + dateRange.from.valueOf()
        + '&_id<' + dateRange.to.valueOf();
    },

    getDateRange: function()
    {
      var month = time.utc.getMoment(this.month + '-01', 'YYYY-MM-DD');
      var from = month.clone();
      var to = month.clone().add(1, 'month');

      if (month.isoWeekday() !== 1)
      {
        from.subtract(month.isoWeekday() - 1, 'days');
      }

      if (month.endOf('month').isoWeekday() !== 7)
      {
        to.add(7 - month.isoWeekday(), 'days');
      }

      return {
        from: from,
        to: to
      };
    },

    parse: function(res)
    {
      var map = {};

      res.collection.forEach(plan =>
      {
        plan._id = time.utc.format(plan._id, 'YYYY-MM-DD');

        map[plan._id] = plan;
      });

      var list = [];
      var dateRange = this.getDateRange();
      var to = dateRange.to.valueOf();
      var month = time.utc.getMoment(this.month, 'YYYY-MM');
      var currentShift = getShiftStartInfo(Date.now()).moment;

      while (dateRange.from.valueOf() < to)
      {
        var id = dateRange.from.format('YYYY-MM-DD');
        var plan = map[id] || {
          _id: id,
          stats: []
        };

        plan.from = '06:00';
        plan.to = '06:00';
        plan.currentMonth = dateRange.from.year() === month.year()
          && dateRange.from.month() === month.month();
        plan.currentDay = dateRange.from.year() === currentShift.year()
          && dateRange.from.month() === currentShift.month()
          && dateRange.from.date() === currentShift.date();

        if (plan.stats.length)
        {
          if (plan.stats[0].startAt)
          {
            plan.from = time.utc.format(plan.stats[0].startAt, 'HH:mm');
          }

          if (plan.stats[0].finishAt)
          {
            plan.to = time.utc.format(plan.stats[0].finishAt, 'HH:mm');
          }

          if (plan.to === '13:59')
          {
            plan.to = '14:00';
          }
          else if (plan.to === '21:59')
          {
            plan.to = '22:00';
          }
          else if (plan.to === '05:59')
          {
            plan.to = '06:00';
          }
        }

        list.push(plan);

        dateRange.from.add(1, 'days');
      }

      return list;
    },

    prevMonth: function()
    {
      this.setMonth(time.getMoment(this.month, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
    },

    nextMonth: function()
    {
      this.setMonth(time.getMoment(this.month, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
    },

    setMonth: function(newMonth)
    {
      this.month = newMonth;

      this.trigger('change:month');
    }

  }, {

    fromQuery: function(query)
    {
      var month = query.month;

      if (!month || !time.utc.getMoment(month + '-01', 'YYYY-MM-DD').isValid())
      {
        month = time.getMoment().format('YYYY-MM');
      }

      return new this(null, {
        month: month,
        paginate: false
      });
    }

  });
});

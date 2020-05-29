// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Collection',
  'app/planning/util/shift'
], function(
  time,
  Collection,
  shiftUtil
) {
  'use strict';

  function parse(plan)
  {
    var workingShifts = [];

    plan.stats.forEach(function(shift)
    {
      workingShifts.push(!!shift.startAt);
    });

    var moment = time.utc.getMoment(plan._id);

    return {
      _id: moment.format('YYYY-MM-DD'),
      date: moment.toDate(),
      workingShifts: workingShifts
    };
  }

  return Collection.extend({

    paginate: false,

    initialize: function()
    {
      this.firstWorkingPlans = {};

      this.on('sync', function()
      {
        this.firstWorkingPlans = {};
      });
    },

    url: function()
    {
      var currentPlan = shiftUtil.getPlanDate(Date.now(), true).subtract(7, 'days').valueOf();

      return '/planning/plans'
        + '?select(stats.startAt,stats.finishAt)&sort(_id)&limit(0)'
        + '&_id>=' + currentPlan;
    },

    parse: function(res)
    {
      return (res.collection || []).map(parse);
    },

    update: function(plan, stats)
    {
      this.firstWorkingPlans = {};

      if (!this.get(plan))
      {
        this.add({_id: plan});
      }

      this.get(plan).set(parse({
        _id: plan,
        stats: stats
      }));
    },

    getFirstWorkingPlanBefore: function(dateOrTime)
    {
      var ts = dateOrTime instanceof Date ? dateOrTime.getTime() : dateOrTime;

      if (typeof this.firstWorkingPlans[ts] !== 'undefined')
      {
        return this.firstWorkingPlans[ts];
      }

      var moment = time.utc.getMoment(ts).startOf('day');

      do
      {
        var planDate = moment.subtract(24, 'hours').format('YYYY-MM-DD');
        var plan = this.get(planDate);

        if (!plan)
        {
          this.firstWorkingPlans[ts] = null;

          return null;
        }

        if (plan.get('workingShifts')[0])
        {
          this.firstWorkingPlans[ts] = plan;

          return plan;
        }
      }
      while (true); // eslint-disable-line no-constant-condition
    }

  }, {

    parse: parse

  });
});

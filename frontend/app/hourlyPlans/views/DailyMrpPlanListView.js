// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/hourlyPlans/templates/dailyMrpPlans/list'
], function(
  _,
  time,
  t,
  user,
  ListView,
  template
) {
  'use strict';

  return ListView.extend({

    template: template,

    remoteTopics: {
      'dailyMrpPlans.imported': 'refreshCollection'
    },

    serialize: function()
    {
      var data = ListView.prototype.serialize.apply(this, arguments);
      var to = data.rows[0].moment.clone().subtract(1, 'days');
      var from = to.clone().subtract(6, 'days');

      data.prevLink = '#dailyMrpPlans;list'
        + '?select(date,mrp,orders._id,lines._id,lines.workerCount)'
        + '&date>=' + from.valueOf() + '&date<=' + to.valueOf();

      from = data.rows[6].moment.clone().add(1, 'days');
      to = from.clone().add(6, 'days');

      data.nextLink = '#dailyMrpPlans;list'
        + '?select(date,mrp,orders._id,lines._id,lines.workerCount)'
        + '&date>=' + from.valueOf() + '&date<=' + to.valueOf();

      return data;
    },

    serializeColumns: function()
    {
      return [
        {id: 'date', className: 'is-min', label: t('hourlyPlans', 'property:date')}
      ];
    },

    serializeRows: function()
    {
      var from = _.find(
        this.collection.rqlQuery.selector.args,
        function(term) { return term.name === 'ge' && term.args[0] === 'date'; }
      ).args[1];
      var daysList = [];
      var daysMap = {};

      for (var i = 0; i < 7; ++i)
      {
        var moment = time.getMoment(from).add(i, 'days');
        var day = {
          moment: moment,
          date: moment.format('YYYY-MM-DD'),
          mrps: []
        };

        daysMap[day.moment.valueOf()] = day;
        daysList.push(day);
      }

      this.collection.forEach(function(dailyMrpPlan)
      {
        var day = daysMap[dailyMrpPlan.date.getTime()];

        if (!day)
        {
          return;
        }

        day.mrps.push({
          _id: dailyMrpPlan.mrp.id,
          lines: dailyMrpPlan.get('lines'),
          orderCount: (dailyMrpPlan.get('orders') || []).length
        });
      });

      daysList.forEach(function(day)
      {
        day.mrps.sort(function(a, b) { return a._id.localeCompare(b._id); });
      });

      return daysList;
    }
  });
});

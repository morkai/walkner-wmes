// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model'
], function(
  _,
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/kaizen/reports/summary',

    nlsDomain: 'kaizenOrders',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        section: [],
        confirmer: [],
        interval: 'week'
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
        _.pick(this.attributes, ['from', 'to', 'section', 'confirmer'])
      );

      options.data.section = options.data.section.join(',');
      options.data.confirmer = options.data.confirmer.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/kaizenSummaryReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&section=' + this.get('section')
        + '&confirmer=' + this.get('confirmer');
    },

    parse: function(report)
    {
      var attrs = {
        total: {
          averageDuration: report.averageDuration,
          count: report.count
        },
        averageDuration: [],
        count: {
          open: [],
          finished: [],
          cancelled: []
        },
        nearMissOwners: {
          categories: [],
          open: [],
          finished: [],
          cancelled: []
        }
      };
      var averageDuration = attrs.averageDuration;
      var count = attrs.count;
      var nearMissOwners = attrs.nearMissOwners;

      _.forEach(report.nearMissOwners, function(d)
      {
        nearMissOwners.categories.push(report.users[d[0]]);
        nearMissOwners.open.push(d[2]);
        nearMissOwners.finished.push(d[3]);
        nearMissOwners.cancelled.push(d[4]);
      });

      _.forEach(report.groups, function(group)
      {
        if (typeof group === 'number')
        {
          averageDuration.push({
            x: group,
            y: 0
          });
          count.open.push({x: group, y: 0});
          count.finished.push({x: group, y: 0});
          count.cancelled.push({x: group, y: 0});
        }
        else
        {
          averageDuration.push({
            x: group.key,
            y: group.averageDuration,
            color: group.averageDuration > 5 ? '#d9534f' : '#5cb85c'
          });
          count.open.push({x: group.key, y: group.count.open});
          count.finished.push({x: group.key, y: group.count.finished});
          count.cancelled.push({x: group.key, y: group.count.cancelled});
        }
      });

      return attrs;
    }

  }, {

    fromQuery: function(query)
    {
      if (query.from === undefined && query.to === undefined)
      {
        query.from = time.getMoment().startOf('month').subtract(3, 'months').valueOf();
      }

      return new this({
        from: +query.from || undefined,
        to: +query.to || undefined,
        section: _.isEmpty(query.section) ? [] : query.section.split(','),
        confirmer: _.isEmpty(query.confirmer) ? [] : query.confirmer.split(',')
      });
    }

  });
});

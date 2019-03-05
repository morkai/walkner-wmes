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

    urlRoot: '/suggestions/reports/engagement',

    nlsDomain: 'suggestions',

    defaults: function()
    {
      return {
        from: 0,
        to: 0,
        status: [],
        interval: 'month',
        sections: []
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
        _.pick(this.attributes, ['from', 'to', 'status', 'interval', 'sections'])
      );
      options.data.status = options.data.status.join(',');
      options.data.sections = options.data.sections.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/suggestionEngagementReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&status=' + this.get('status')
        + '&sections=' + this.get('sections');
    },

    parse: function(report)
    {
      var attrs = {
        groups: []
      };

      _.forEach(report.groups, function(group, groupKey)
      {
        var totals = {
          name: 0,
          nearMisses: 0,
          suggestions: 0,
          behaviorObs: 0,
          minutesForSafety: 0
        };

        group = {
          key: +groupKey,
          totals: totals,
          users: _.map(group, function(user, userKey)
          {
            totals.name += 1;
            totals.nearMisses += user.nearMisses;
            totals.suggestions += user.suggestions;
            totals.behaviorObs += user.behaviorObs;
            totals.minutesForSafety += user.minutesForSafety;

            return {
              name: report.users[userKey],
              nearMisses: user.nearMisses,
              suggestions: user.suggestions,
              behaviorObs: user.behaviorObs,
              minutesForSafety: user.minutesForSafety,
              sections: Object.keys(user.sections).map(function(section)
              {
                return report.sections[section] || section;
              })
            };
          })
        };

        group.users.sort(function(a, b)
        {
          return a.name.localeCompare(b.name);
        });

        attrs.groups.push(group);
      });

      attrs.groups.sort(function(a, b)
      {
        return a.key - b.key;
      });

      if (attrs.groups.length)
      {
        this.attributes.groups = [];
      }

      return attrs;
    },

    serializeToCsv: function()
    {
      var rows = [
        'date;name;nearMisses;suggestions;behaviorObs;minutesForSafety;sections'
      ];

      _.forEach(this.get('groups'), function(group)
      {
        var row = time.format(group.key, 'YYYY-MM-DD') + ';';

        _.forEach(group.users, function(user)
        {
          rows.push(
            row + '"' + user.name
            + '";' + user.nearMisses
            + ';' + user.suggestions
            + ';' + user.behaviorObs
            + ';' + user.minutesForSafety
            + ';"' + user.sections.join(',') + '"'
          );
        });
      });

      return rows.join('\r\n');
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
        interval: query.interval || 'month',
        status: _.isEmpty(query.status) ? [] : query.status.split(','),
        sections: _.isEmpty(query.sections) ? [] : query.sections.split(',')
      });
    }

  });
});

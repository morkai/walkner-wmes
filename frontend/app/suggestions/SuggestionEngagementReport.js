// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
        interval: 'month'
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        _.pick(this.attributes, ['from', 'to', 'status', 'interval'])
      );

      options.data.status = options.data.status.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/suggestionEngagementReport'
        + '?from=' + this.get('from')
        + '&to=' + this.get('to')
        + '&interval=' + this.get('interval')
        + '&status=' + this.get('status');
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
          suggestions: 0
        };

        group = {
          key: +groupKey,
          totals: totals,
          users: _.map(group, function(user, userKey)
          {
            totals.name += 1;
            totals.nearMisses += user.nearMisses;
            totals.suggestions += user.suggestions;

            return {
              name: report.users[userKey],
              nearMisses: user.nearMisses,
              suggestions: user.suggestions,
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
        'date;name;nearMisses;suggestions;sections'
      ];

      _.forEach(this.get('groups'), function(group)
      {
        var row = time.format(group.key, 'YYYY-MM-DD') + ';';

        _.forEach(group.users, function(user)
        {
          rows.push(
            row + '"' + user.name + '";' + user.nearMisses + ';' + user.suggestions
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
        status: _.isEmpty(query.status) ? [] : query.status.split(','),
        interval: query.interval || 'month'
      });
    }

  });
});

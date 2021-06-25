// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model'
], function(
  _,
  t,
  time,
  currentUser,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/suggestions/reports/reward',

    nlsDomain: 'suggestions',

    defaults: function()
    {
      return {
        month: null,
        confirmer: null,
        superior: null,
        users: []
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
        _.pick(this.attributes, ['month', 'confirmer', 'superior'])
      );

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/suggestions/reports/reward'
        + '?month=' + this.get('month')
        + '&confirmer=' + this.get('confirmer')
        + '&superior=' + this.get('superior');
    },

    parse: function(report)
    {
      report.users.forEach(function(user)
      {
        user.total = [
          user.finished[0] + user.kom[0],
          user.finished[1] + user.kom[1]
        ];
        user.value = user.finished[1] * report.options.reward.kz
          + user.kom[1] * report.options.reward.kom;
        user.sections = user.sections.map(function(s) { return report.sections[s] || s; });
      });

      return {
        users: report.users
      };
    },

    serializeToCsv: function()
    {
      var rows = [
        'name;finishedCount;finishedPart;kotmCount;kotmPart;totalCount;totalPart;gratification;sections'
      ];

      _.forEach(this.get('users'), function(user)
      {
        rows.push(
          '"' + user.name
          + '";' + user.finished[0].toLocaleString()
          + ';' + user.finished[1].toLocaleString()
          + ';' + user.kom[0].toLocaleString()
          + ';' + user.kom[1].toLocaleString()
          + ';' + user.total[0].toLocaleString()
          + ';' + user.total[1].toLocaleString()
          + ';' + user.value.toLocaleString()
          + ';"' + user.sections.join(',') + '"'
        );
      });

      return rows.join('\r\n');
    }

  }, {

    fromQuery: function(query)
    {
      if (query.superior == null || !currentUser.isAllowedTo('SUGGESTIONS:MANAGE', 'KAIZEN:DICTIONARIES:MANAGE'))
      {
        query.superior = currentUser.data._id;
      }

      return new this({
        month: query.month || time.getMoment().startOf('month').subtract(1, 'months').format('YYYY-MM'),
        confirmer: query.confirmer || null,
        superior: query.superior
      });
    }

  });
});

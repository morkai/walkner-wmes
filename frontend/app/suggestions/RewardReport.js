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

    urlRoot: '/suggestions/reports/reward',

    nlsDomain: 'suggestions',

    defaults: function()
    {
      return {
        month: null,
        sections: [],
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
        _.pick(this.attributes, ['month', 'sections'])
      );
      options.data.sections = options.data.sections.join(',');

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return '/suggestionRewardReport'
        + '?month=' + this.get('month')
        + '&sections=' + this.get('sections');
    },

    parse: function(report)
    {
      report.users.forEach(function(user)
      {
        user.total = user.finished + user.kom;
        user.sections = user.sections.map(function(s) { return report.sections[s] || s; });
      });

      return {
        users: report.users
      };
    },

    serializeToCsv: function()
    {
      var rows = [
        'name;finished;kotm;total;sections'
      ];

      _.forEach(this.get('users'), function(user)
      {
        rows.push(
          '"' + user.name
          + '";' + user.finished
          + ';' + user.kom
          + ';' + user.total
          + ';"' + user.sections.join(',') + '"'
        );
      });

      return rows.join('\r\n');
    }

  }, {

    fromQuery: function(query)
    {
      return new this({
        month: query.month || time.getMoment().startOf('month').subtract(1, 'months').format('YYYY-MM'),
        sections: _.isEmpty(query.sections) ? [] : query.sections.split(',')
      });
    }

  });
});

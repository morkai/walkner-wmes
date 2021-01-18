// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/time',
  'app/core/Model'
], function(
  _,
  rql,
  t,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/reports/engagement',

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {
        settings: {},
        months: [],
        orgUnits: [],
        users: []
      };
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : rql.parse(
        `date>=${time.getMoment().startOf('month').subtract(3, 'months').valueOf()}`
      );
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = this.rqlQuery.toString();

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return `${this.urlRoot}?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      return {
        settings: report.settings,
        months: report.months,
        orgUnits: report.orgUnits,
        users: report.users
      };
    }

  });
});

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/time',
  'app/core/Model',
  './util/createDefaultFilter'
], function(
  _,
  rql,
  t,
  time,
  Model,
  createDefaultFilter
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/reports/engagement',

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {
        settings: {},
        userLabels: {},
        months: [],
        orgUnits: [],
        brigades: [],
        users: []
      };
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        orgUnitProperty: null
      });
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
      return report;
    }

  });
});

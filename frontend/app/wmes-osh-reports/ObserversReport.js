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

    urlRoot: '/osh/reports/observers',

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {
        loading: false,
        settings: {},
        months: [],
        orgUnits: [],
        users: []
      };
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        orgUnitProperty: null
      });

      this.on('request', () => this.set('loading', true));
      this.on('sync error', () => this.set('loading', false));
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
      return `/osh/reports/observers?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      return report;
    }

  });
});

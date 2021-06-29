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

    urlRoot: '/osh/reports/rewards',

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {
        loading: false,
        settings: {},
        users: []
      };
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        orgUnitProperty: null,
        dateProperty: false,
        extraTerms: terms =>
        {
          terms.push(
            {name: 'eq', args: ['status', 'payout']}
          );
        }
      });

      this.on('request', () => this.set({loading: true, users: []}));
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
      return `${this.urlRoot}?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      report.loaded = true;

      return report;
    },

    getMinPayout: function()
    {
      return this.get('settings').minPayout || 1;
    },

    hasAnyPayouts: function()
    {
      const minPayout = this.getMinPayout();

      return this.get('users').some(u => u.payout[1] >= minPayout);
    },

    getPayouts: function()
    {
      const minPayout = this.getMinPayout();

      return this.get('users').filter(u => u.payout[1] >= minPayout);
    }

  });
});

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/orders/OrderCollection'
], function(
  _,
  OrderCollection
) {
  'use strict';

  return OrderCollection.extend({

    url: '/reports/2;orders',

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          name: 1,
          mrp: 1,
          qty: 1,
          statusesSetAt: 1,
          startDate: 1,
          delayReason: 1,
          changes: 1
        }
      });
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error("query option is required!");
      }

      this.query = options.query;
      this.displayOptions = options.displayOptions;

      this.rqlQuery.limit = +this.query.get('limit');
      this.rqlQuery.skip = +this.query.get('skip');
    },

    sync: function()
    {
      var selector = this.rqlQuery.selector;

      selector.args = [
        eq('from', +this.query.get('from')),
        eq('to', +this.query.get('to'))
      ];

      var orgUnitType = this.query.get('orgUnitType');
      var orgUnitId = this.query.get('orgUnitId');

      if (orgUnitType && orgUnitId)
      {
        selector.args.push(
          eq('orgUnitType', orgUnitType),
          eq('orgUnitId', orgUnitId)
        );
      }

      var statuses = this.query.get('statuses');

      if (statuses.length)
      {
        selector.args.push(
          eq('filter', this.query.get('filter')),
          eq('statuses', statuses)
        );
      }

      return OrderCollection.prototype.sync.apply(this, arguments);

      function eq(key, val)
      {
        return {name: 'eq', args: [key, val]};
      }
    },

    genPaginationUrlTemplate: function()
    {
      var query = this.query.serializeToString()
        .replace(/limit=[0-9]+/, 'limit=${limit}')
        .replace(/skip=[0-9]+/, 'skip=${skip}');

      return '#reports/2'
        + '?' + query
        + '#' + (this.displayOptions ? this.displayOptions.serializeToString() : '');
    }

  });
});

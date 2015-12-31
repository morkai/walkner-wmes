// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      var query = this.query;
      var orderNo = query.get('orderNo');

      if (orderNo.length >= 6)
      {
        selector.args = [eq('orderNo', orderNo)];

        return OrderCollection.prototype.sync.apply(this, arguments);
      }

      selector.args = [
        eq('from', +query.get('from')),
        eq('to', +query.get('to'))
      ];

      var orgUnitType = query.get('orgUnitType');
      var orgUnitId = query.get('orgUnitId');

      if (orgUnitType && orgUnitId)
      {
        selector.args.push(
          eq('orgUnitType', orgUnitType),
          eq('orgUnitId', orgUnitId)
        );
      }

      var statuses = query.get('statuses');

      selector.args.push(eq('filter', query.get('filter')));

      if (statuses.length)
      {
        selector.args.push(eq('statuses', statuses));
      }

      var hour = query.get('hour');

      if (hour)
      {
        selector.args.push(eq('hourMode', query.get('hourMode')));
        selector.args.push(eq('hour', +hour));
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

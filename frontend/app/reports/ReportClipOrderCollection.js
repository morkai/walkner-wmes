// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/orders/OrderCollection'
], function(
  _,
  OrderCollection
) {
  'use strict';

  return OrderCollection.extend({

    nlsDomain: 'reports',

    url: '/reports/clip/orders',

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        limit: 25
      });
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.hash = null;
      this.query = options.query;
      this.displayOptions = options.displayOptions;

      this.rqlQuery.limit = +this.query.get('limit');
      this.rqlQuery.skip = +this.query.get('skip');
    },

    sync: function()
    {
      this.hash = null;
      this.rqlQuery.selector.args = [
        {name: 'eq', args: ['hash', this.query.get('orderHash')]},
        {name: 'eq', args: ['count', this.query.get('orderCount')]}
      ];

      return OrderCollection.prototype.sync.apply(this, arguments);
    },

    parse: function(res)
    {
      var collection = this;

      if (collection.paginationData)
      {
        collection.paginationData.set(collection.getPaginationData(res));
      }

      return !Array.isArray(res.collection) ? [] : res.collection.map(function(doc)
      {
        collection.hash = doc._id.hash;
        doc._id = doc._id.no;

        return doc;
      });
    },

    genPaginationUrlTemplate: function()
    {
      var query = this.query.serializeToString()
        .replace(/limit=[0-9]+/, 'limit=${limit}')
        .replace(/skip=[0-9]+/, 'skip=${skip}');

      return '#reports/clip'
        + '?' + query
        + '#' + (this.displayOptions ? this.displayOptions.serializeToString() : '');
    }

  });
});

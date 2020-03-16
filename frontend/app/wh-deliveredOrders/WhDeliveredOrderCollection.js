// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/Collection',
  './WhDeliveredOrder'
], function(
  _,
  Collection,
  WhDeliveredOrder
) {
  'use strict';

  return Collection.extend({

    model: WhDeliveredOrder,

    rqlQuery: 'limit(-1337)',

    getLineFilter: function()
    {
      return _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'line';
      });
    },

    getSapOrderFilter: function()
    {
      return _.find(this.rqlQuery.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'sapOrder';
      });
    }

  });
});

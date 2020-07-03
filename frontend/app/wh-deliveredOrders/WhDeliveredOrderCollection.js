// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/Collection',
  './WhDeliveredOrder'
], function(
  _,
  user,
  Collection,
  WhDeliveredOrder
) {
  'use strict';

  return Collection.extend({

    model: WhDeliveredOrder,

    rqlQuery: 'sort(date,set,startTime)&limit(-1337)',

    getLineFilter: function()
    {
      var term = this.findRqlTerm('line', 'eq');

      return term ? term.args[1] : null;
    },

    getSapOrderFilter: function()
    {
      var term = this.findRqlTerm('sapOrder', 'eq');

      return term ? term.args[1] : null;
    },

    getStatusFilter: function()
    {
      var term = this.findRqlTerm('status', 'in');

      return term && term.args[1].length ? term.args[1] : ['todo', 'done', 'blocked'];
    }

  }, {

    can: {
      view: function()
      {
        return user.isAllowedTo('WH:VIEW', 'PLANNING:VIEW');
      },
      manage: function()
      {
        return user.isAllowedTo('WH:MANAGE', 'PLANNING:MANAGE', 'PLANNING:PLANNER');
      }
    }

  });
});

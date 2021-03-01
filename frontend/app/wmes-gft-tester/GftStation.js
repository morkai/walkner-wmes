// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/Model'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'wmes-gft-tester',

    initialize: function()
    {
      this.order = new Model();
      this.tester = new Model();
    },

    url: function()
    {
      return `/gft/stations/${this.get('line')}/${this.get('station')}`;
    },

    parse: function(res)
    {
      if (res.order)
      {
        if (res.order.orderNo)
        {
          this.order.set(res.order);
        }
        else
        {
          this.order.clear();
        }
      }

      if (res.tester)
      {
        this.tester.set(res.tester);
      }
      else
      {
        this.tester.clear();
      }

      delete res.order;
      delete res.tester;

      return res;
    },

    update: function(newState)
    {
      if (newState.order)
      {
        if (newState.order.orderNo)
        {
          this.order.set(newState.order);
        }
        else
        {
          this.order.clear();
        }
      }

      if (newState.tester === null)
      {
        this.tester.clear();
      }
      else if (newState.tester)
      {
        this.tester.set(newState.tester);
      }

      delete newState.tester;

      this.set(newState);
    }

  });
});

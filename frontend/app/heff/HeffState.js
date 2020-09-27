// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/Model',
  'app/prodShifts/ProdShift',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntimeCollection'
], function(
  _,
  Model,
  ProdShift,
  ProdShiftOrderCollection,
  ProdDowntimeCollection
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'heff',

    initialize: function()
    {
      this.prodShift = new ProdShift();
      this.prodShiftOrders = new ProdShiftOrderCollection();
      this.planShiftOrders = new ProdShiftOrderCollection();
      this.prodDowntimes = new ProdDowntimeCollection();
    },

    url: function()
    {
      return '/heff/' + this.get('prodLine');
    },

    parse: function(res)
    {
      if (res.prodDowntimes)
      {
        this.prodDowntimes.reset(res.prodDowntimes);
      }

      if (res.planShiftOrders)
      {
        this.planShiftOrders.reset(res.planShiftOrders);
      }

      if (res.prodShiftOrders)
      {
        this.prodShiftOrders.reset(res.prodShiftOrders);
      }

      if (res.prodShift)
      {
        this.prodShift.set(res.prodShift);
      }

      delete res.prodShift;
      delete res.prodShiftOrders;
      delete res.planShiftOrders;
      delete res.prodDowntimes;

      return res;
    },

    update: function(newState)
    {
      var model = this;
      var reload = false;

      if (newState.prodShift)
      {
        if (newState.prodShift._id && newState.prodShift._id !== model.prodShift.id)
        {
          reload = true;
        }
        else
        {
          model.prodShift.set(newState.prodShift);
        }
      }

      if (!reload && newState.finishedPso)
      {
        newState.finishedPso.forEach(function(psoOrId)
        {
          var pso;

          if (typeof psoOrId === 'string')
          {
            pso = model.prodShiftOrders.get(psoOrId);

            if (pso)
            {
              pso.set('finishedAt', (new Date()).toISOString());
            }
            else
            {
              reload = true;
            }
          }
          else
          {
            pso = model.prodShiftOrders.get(psoOrId._id);

            if (pso)
            {
              pso.set(psoOrId);
            }
          }
        });
      }

      if (!reload && newState.prodShiftOrder)
      {
        if (newState.prodShiftOrder._id)
        {
          var pso = model.prodShiftOrders.get(newState.prodShiftOrder._id);

          if (pso)
          {
            pso.set(newState.prodShiftOrder);
          }
          else if (newState.prodShiftOrder.operations)
          {
            model.prodShiftOrders.add(newState.prodShiftOrder);
          }
          else
          {
            reload = true;
          }
        }
        else
        {
          var currentPso = model.prodShiftOrders.find({finishedAt: null});

          if (currentPso)
          {
            currentPso.set(newState.prodShiftOrder);
          }
          else
          {
            reload = true;
          }
        }
      }

      if (!reload && newState.prodDowntime)
      {
        if (newState.prodDowntime._id)
        {
          var pdt = model.prodDowntimes.get(newState.prodDowntime._id);

          if (pdt)
          {
            pdt.set(newState.prodDowntime);
          }
          else if (newState.prodDowntime.orderData)
          {
            model.prodDowntimes.add(newState.prodDowntime);
          }
          else
          {
            reload = true;
          }
        }
        else
        {
          var currentPdt = model.prodDowntimes.find({finishedAt: null});

          if (currentPdt)
          {
            currentPdt.set(newState.prodDowntime);
          }
          else
          {
            reload = true;
          }
        }
      }
      else if (newState.prodDowntime === null)
      {
        var finishedPdt = model.prodDowntimes.find({finishedAt: null});

        if (finishedPdt)
        {
          finishedPdt.set('finishedAt', (new Date()).toISOString());
        }
        else
        {
          reload = true;
        }
      }

      if (reload)
      {
        this.fetch();
      }
    }

  });
});

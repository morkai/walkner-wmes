// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Model',
  '../prodShifts/ProdShift',
  '../prodShiftOrders/ProdShiftOrder',
  '../prodShiftOrders/ProdShiftOrderCollection',
  '../prodDowntimes/ProdDowntime',
  '../prodDowntimes/ProdDowntimeCollection'
], function(
  Model,
  ProdShift,
  ProdShiftOrder,
  ProdShiftOrderCollection,
  ProdDowntime,
  ProdDowntimeCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/production/state',

    clientUrlRoot: '#factoryLayout',

    topicPrefix: 'production',

    privilegePrefix: 'FACTORY_LAYOUT',

    nlsDomain: 'factoryLayout',

    defaults: {
      v: 0,
      state: null,
      stateChangedAt: 0,
      online: false,
      extended: false,
      plannedQuantityDone: 0,
      actualQuantityDone: 0,
      prodShift: null,
      prodShiftOrders: null,
      prodDowntimes: null
    },

    getLabel: function()
    {
      return this.getProdLineId().substr(0, 10).toUpperCase().replace(/_$/, '').replace(/_/g, ' ');
    },

    getProdLineId: function()
    {
      return this.attributes.prodShift === null ? this.id : this.attributes.prodShift.get('prodLine');
    },

    update: function(data)
    {
      var attrs = this.attributes;
      var prodShiftChanged = false;
      var prodShiftOrdersChanged = null;
      var prodDowntimesChanges = null;

      if (typeof data.prodShift === 'object')
      {
        if (data.prodShift === null)
        {
          attrs.prodShift = null;
        }
        else if (attrs.prodShift === null)
        {
          attrs.prodShift = new ProdShift(ProdShift.parse(data.prodShift));
        }
        else
        {
          attrs.prodShift.set(ProdShift.parse(data.prodShift));
        }

        prodShiftChanged = true;

        delete data.prodShift;
      }

      if (Array.isArray(data.prodShiftOrders))
      {
        attrs.prodShiftOrders.reset(data.prodShiftOrders.map(ProdShiftOrder.parse));

        prodShiftOrdersChanged = {reset: true};

        delete data.prodShiftOrders;
      }
      else if (data.prodShiftOrders)
      {
        var prodShiftOrder = attrs.prodShiftOrders.get(data.prodShiftOrders._id);

        if (prodShiftOrder)
        {
          prodShiftOrder.set(ProdShiftOrder.parse(data.prodShiftOrders));
        }
        else
        {
          attrs.prodShiftOrders.add(ProdShiftOrder.parse(data.prodShiftOrders));
        }

        prodShiftOrdersChanged = {reset: false};

        delete data.prodShiftOrders;
      }

      if (Array.isArray(data.prodDowntimes))
      {
        attrs.prodDowntimes.reset(data.prodDowntimes.map(ProdDowntime.parse));

        prodDowntimesChanges = {reset: true};

        delete data.prodDowntimes;
      }
      else if (data.prodDowntimes)
      {
        var prodDowntime = attrs.prodDowntimes.get(data.prodDowntimes._id);

        if (prodDowntime)
        {
          prodDowntime.set(ProdDowntime.parse(data.prodDowntimes));
        }
        else
        {
          attrs.prodDowntimes.add(ProdDowntime.parse(data.prodDowntimes));
        }

        prodDowntimesChanges = {reset: false};

        delete data.prodDowntimes;
      }

      if (prodShiftChanged)
      {
        this.trigger('change:prodShift');
      }

      if (prodShiftOrdersChanged)
      {
        this.trigger('change:prodShiftOrders', prodShiftOrdersChanged);
      }

      if (prodDowntimesChanges)
      {
        this.trigger('change:prodDowntimes', prodDowntimesChanges);
      }

      if (Object.keys(data).length)
      {
        this.set(data);
      }
      else
      {
        this.trigger('change');
      }
    }

  }, {

    parse: function(data)
    {
      var prodShiftOrders = new ProdShiftOrderCollection();
      prodShiftOrders.comparator = 'startedAt';
      prodShiftOrders.reset(data.prodShiftOrders.map(ProdShiftOrder.parse));

      var prodDowntimes = new ProdDowntimeCollection();
      prodDowntimes.comparator = 'startedAt';
      prodDowntimes.reset(data.prodDowntimes.map(ProdDowntime.parse));

      data.prodShift = data.prodShift ? new ProdShift(ProdShift.parse(data.prodShift)) : null;
      data.prodShiftOrders = prodShiftOrders;
      data.prodDowntimes = prodDowntimes;

      return data;
    }

  });
});

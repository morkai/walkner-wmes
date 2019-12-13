// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model',
  '../prodShifts/ProdShift',
  '../prodShiftOrders/ProdShiftOrder',
  '../prodShiftOrders/ProdShiftOrderCollection',
  '../prodDowntimes/ProdDowntime',
  '../prodDowntimes/ProdDowntimeCollection'
], function(
  _,
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

    initialize: function(attrs, options)
    {
      this.settings = options && options.settings ? options.settings : null;
    },

    getLabel: function()
    {
      if (!this.attributes.label)
      {
        var label = this.getProdLineId()
          .toUpperCase()
          .replace(/(_+|~.*?)$/, '')
          .replace(/[_-]+/g, ' ');

        if (label.length > 10)
        {
          label = label.replace(/ +/g, '');
        }

        this.attributes.label = label;
      }

      return this.attributes.label;
    },

    getProdLineId: function()
    {
      return this.attributes.prodShift === null ? this.id : this.attributes.prodShift.get('prodLine');
    },

    getCurrentOrder: function()
    {
      if (!this.attributes.prodShiftOrders)
      {
        return null;
      }

      var order = this.attributes.prodShiftOrders.last();

      return order && !order.get('finishedAt') ? order : null;
    },

    getCurrentDowntime: function()
    {
      if (!this.attributes.prodDowntimes)
      {
        return null;
      }

      var downtime = this.attributes.prodDowntimes.last();

      return downtime && !downtime.get('finishedAt') ? downtime : null;
    },

    isTaktTimeOk: function()
    {
      var prodShiftOrders = this.get('prodShiftOrders');

      if (!prodShiftOrders || !prodShiftOrders.length)
      {
        return true;
      }

      var currentProdShiftOrder = prodShiftOrders.last();

      if (currentProdShiftOrder.get('finishedAt')
        || !this.settings
        || !this.settings.production.isTaktTimeEnabled(this.id))
      {
        return true;
      }

      var actualTaktTime = currentProdShiftOrder.get('avgTaktTime') / 1000;
      var sapTaktTime = currentProdShiftOrder.getSapTaktTime(this.settings.production);

      return !actualTaktTime || actualTaktTime <= sapTaktTime;
    },

    update: function(data)
    {
      data = _.clone(data);

      var attrs = this.attributes;
      var prodShiftChanged = false;
      var prodShiftOrdersChanges = null;
      var prodDowntimesChanges = null;
      var taktTimeChanges = null;

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

        prodShiftOrdersChanges = {reset: true};

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

        prodShiftOrdersChanges = {
          reset: false
        };

        if (data.prodShiftOrders.lastTaktTime)
        {
          taktTimeChanges = data.prodShiftOrders;
        }

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

      if (prodShiftOrdersChanges)
      {
        this.trigger('change:prodShiftOrders', prodShiftOrdersChanges);
      }

      if (prodDowntimesChanges)
      {
        this.trigger('change:prodDowntimes', prodDowntimesChanges);
      }

      if (taktTimeChanges)
      {
        this.trigger('change:taktTime', this, taktTimeChanges);
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

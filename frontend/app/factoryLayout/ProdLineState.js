// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/Model',
  'app/prodShifts/ProdShift',
  'app/prodShiftOrders/ProdShiftOrder',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/prodDowntimes/ProdDowntime',
  'app/prodDowntimes/ProdDowntimeCollection',
  'app/planning/util/shift'
], function(
  _,
  time,
  Model,
  ProdShift,
  ProdShiftOrder,
  ProdShiftOrderCollection,
  ProdDowntime,
  ProdDowntimeCollection,
  shiftUtil
) {
  'use strict';

  return Model.extend({

    urlRoot: '/production/state',

    clientUrlRoot: '#factoryLayout',

    topicPrefix: 'production',

    privilegePrefix: 'FACTORY_LAYOUT',

    nlsDomain: 'factoryLayout',

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

    getEfficiencyClassName: function()
    {
      var prodShiftOrders = this.get('prodShiftOrders');

      if (!prodShiftOrders || !prodShiftOrders.length)
      {
        return null;
      }

      var currentPso = prodShiftOrders.last();

      if (currentPso.get('finishedAt'))
      {
        return null;
      }

      return currentPso.getEfficiencyClassName({prodDowntimes: this.get('prodDowntimes')});
    },

    isTaktTimeOk: function()
    {
      var prodShiftOrders = this.get('prodShiftOrders');

      if (!prodShiftOrders || !prodShiftOrders.length)
      {
        return true;
      }

      var currentPso = prodShiftOrders.last();

      if (currentPso.get('finishedAt')
        || !this.settings
        || !this.settings.production.isTaktTimeEnabled(this.id))
      {
        return true;
      }

      var actualTaktTime = currentPso.get('avgTaktTime') / 1000;
      var sapTaktTime = currentPso.getSapTaktTime();

      return !actualTaktTime || actualTaktTime <= sapTaktTime;
    },

    isBreak: function()
    {
      var downtime = this.getCurrentDowntime();

      return !!downtime && downtime.isBreak();
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
    },

    getMetricValue: function(metricName, heff)
    {
      if (!heff)
      {
        return this.get(metricName);
      }

      heff = this.get('heff') || this.recalcHeff();

      if (metricName === 'plannedQuantityDone')
      {
        return heff.endOfHourPlanned;
      }

      if (metricName === 'actualQuantityDone')
      {
        return heff.totalActual;
      }

      return 0;
    },

    recalcHeff: function()
    {
      var result = {
        currentPlanned: 0,
        endOfHourPlanned: 0,
        totalPlanned: 0,
        totalActual: 0,
        totalRemaining: 0,
        status: 'off'
      };

      var prodShift = this.get('prodShift');

      if (!prodShift || !prodShift.get('shift'))
      {
        this.set('heff', result);

        return result;
      }

      var quantitiesDone = prodShift.get('quantitiesDone');
      var currentTime = time.getMoment();
      var currentHour = currentTime.hours();
      var currentMinute = currentTime.minutes();
      var currentHourIndex = shiftUtil.HOUR_TO_INDEX_SHIFT[currentHour];

      for (var hourIndex = 0; hourIndex < 8; ++hourIndex)
      {
        var hourPlanned = quantitiesDone[hourIndex].planned;
        var hourActual = quantitiesDone[hourIndex].actual;

        result.totalPlanned += hourPlanned;
        result.totalActual += hourActual;

        if (hourIndex < currentHourIndex)
        {
          result.currentPlanned += hourPlanned;
          result.endOfHourPlanned += hourPlanned;
        }
        else if (hourIndex === currentHourIndex)
        {
          result.endOfHourPlanned += hourPlanned;
          result.currentPlanned += Math.round(hourPlanned * (currentMinute / 60) * 1000) / 1000;
        }
      }

      result.totalRemaining = Math.max(result.totalPlanned - result.totalActual, 0);
      result.currentPlanned = Math.floor(result.currentPlanned);

      if (result.totalPlanned)
      {
        var outOfSyncWindow = this.settings && this.settings.factoryLayout.getValue('outOfSyncWindow');
        var ratio = Math.round(result.totalActual / result.currentPlanned * 100) - 100;

        if (ratio >= outOfSyncWindow)
        {
          result.status = 'overRatio';
        }
        else if (ratio <= (outOfSyncWindow * -1))
        {
          result.status = 'underRatio';
        }
        else
        {
          result.status = result.totalActual >= result.currentPlanned ? 'over' : 'under';
        }
      }
      else
      {
        result.status = result.totalActual ? 'unplanned' : 'noPlan';
      }

      this.set('heff', result);

      return result;
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

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../data/orgUnits',
  './util/shift',
  './DailyMrpPlanLineOrderCollection'
], function(
  _,
  time,
  Model,
  orgUnits,
  shiftUtil,
  DailyMrpPlanLineOrderCollection
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      return {
        name: '?',
        activeFrom: null,
        activeTo: null,
        workerCount: 0,
        hourlyPlan: shiftUtil.EMPTY_HOURLY_PLAN.slice(),
        pceTimes: [],
        totalQty: 0,
        orders: [],
        downtimes: []
      };
    },

    initialize: function(attrs)
    {
      this.orders = new DailyMrpPlanLineOrderCollection(attrs.orders, {line: this});
    },

    toJSON: function()
    {
      return _.defaults({orders: this.orders.toJSON()}, this.attributes);
    },

    serializeListItem: function()
    {
      return {
        _id: this.id,
        name: this.get('name'),
        workerCount: this.get('workerCount'),
        customTimes: this.serializeCustomTimes()
      };
    },

    serializePopover: function()
    {
      var units = orgUnits.getAllForProdLine(this.id);

      return {
        _id: this.id,
        plan: this.collection.plan.id,
        division: units.division,
        prodFlow: orgUnits.getByTypeAndId('prodFlow', units.prodFlow).getLabel(),
        prodLine: this.get('name'),
        activeFrom: this.get('activeFrom'),
        activeTo: this.get('activeTo'),
        workerCount: this.get('workerCount')
      };
    },

    serializeCustomTimes: function()
    {
      var activeFrom = this.get('activeFrom');
      var activeTo = this.get('activeTo');

      if (!activeFrom && !activeTo)
      {
        return '';
      }

      return (activeFrom || '06:00') + '-' + (activeTo || '06:00');
    },

    hasCustomTimes: function()
    {
      return !!this.get('activeFrom') || !!this.get('activeTo');
    },

    getActiveFromMoment: function(date)
    {
      return this.constructor.getActiveFromMoment(date ? +date : +this.collection.plan.date, this.get('activeFrom'));
    },

    getActiveToMoment: function(date)
    {
      return this.constructor.getActiveToMoment(date ? +date : +this.collection.plan.date, this.get('activeTo'));
    },

    update: function(data)
    {
      var fromMoment = time.getMoment('2017-01-01 ' + (data.activeFrom || '06:00'), 'YYYY-MM-DD HH:mm');
      var toMoment = time.getMoment('2017-01-01 ' + (data.activeTo || '06:00'), 'YYYY-MM-DD HH:mm');

      if (!fromMoment.isValid())
      {
        fromMoment = time.getMoment('2017-01-01T05:00:00.000Z');
      }

      if (!toMoment.isValid())
      {
        toMoment = time.getMoment('2017-01-02T05:00:00.000Z');
      }

      var newActiveFrom = fromMoment.format('HH:mm');
      var newActiveTo = toMoment.format('HH:mm');
      var changes = {
        _id: this.id,
        activeFrom: newActiveFrom === '06:00' ? null : newActiveFrom,
        activeTo: newActiveTo === '06:00' ? null : newActiveTo,
        workerCount: data.workerCount > 0 ? data.workerCount : 0
      };
      var attrs = this.attributes;

      if (_.some(changes, function(v, k) { return attrs[k] !== v; }))
      {
        this.collection.plan.collection.update('updateLine', this.collection.plan.id, changes);
      }
    },

    reset: function()
    {
      this.set({
        hourlyPlan: shiftUtil.EMPTY_HOURLY_PLAN.slice(),
        pceTimes: [],
        totalQty: 0,
        orders: [],
        downtimes: []
      });
      this.orders.reset([]);
    }

  }, {

    getActiveFromMoment: function(date, activeFrom)
    {
      var moment = time.getMoment(+date);
      var h = 6;
      var m = 0;

      if (activeFrom)
      {
        var parts = activeFrom.split(':');

        h = +parts[0];
        m = +parts[1];
      }

      if (h < 6)
      {
        moment.add(1, 'days');
      }

      moment.hours(h).minutes(m);

      return moment;
    },

    getActiveToMoment: function(date, activeTo)
    {
      var moment = time.getMoment(+date);
      var h = 6;
      var m = 0;

      if (activeTo)
      {
        var parts = activeTo.split(':');

        h = +parts[0];
        m = +parts[1];
      }

      if (h < 6 || (h === 6 && m === 0))
      {
        moment.add(1, 'days');
      }

      moment.hours(h).minutes(m);

      return moment;
    }

  });
});

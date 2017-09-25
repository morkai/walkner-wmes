// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model',
  '../core/Collection',
  '../data/orgUnits'
], function(
  _,
  time,
  Model,
  Collection,
  orgUnits
) {
  'use strict';

  function PlanMrp(plan, mrpId)
  {
    var mrp = orgUnits.getByTypeAndId('mrpController', mrpId);
    var mrpSettings = _.find(plan.settings.get('mrps'), {_id: mrpId});

    this.plan = plan;

    this.date = plan.id;

    this.mrp = {
      _id: mrpId,
      description: mrp ? mrp.get('description') : ''
    };

    this.orders = new Collection(plan.orders.where({mrp: mrpId}), {
      model: Model,
      paginate: false
    });

    this.lines = new Collection(!mrpSettings ? [] : mrpSettings.lines.map(function(mrpLineSettings)
    {
      var lineId = mrpLineSettings._id;
      var lineSettings = _.find(plan.settings.get('lines'), {_id: lineId});
      var planLine = plan.lines.get(lineId);
      var mrpLine = new Model({
        _id: lineId,
        activeFrom: lineSettings.activeFrom,
        activeTo: lineSettings.activeTo,
        mrpPriority: lineSettings.mrpPriority,
        orderPriority: mrpLineSettings.orderPriority,
        workerCount: mrpLineSettings.workerCount,
        hourlyPlan: planLine ? planLine.get('hourlyPlan') : [],
      });

      mrpLine.orders = new Collection(planLine ? planLine.get('orders') : [], {
        model: Model,
        paginate: false
      });

      return mrpLine;
    }), {
      model: Model,
      paginate: false
    });
  }

  PlanMrp.prototype.isPrintOrderTimes = function()
  {
    return !!this.plan.options.get('printOrderTimes');
  };

  PlanMrp.prototype.togglePrintOrderTimes = function()
  {
    this.plan.options.set('printOrderTimes', !this.plan.options.get('printOrderTimes'));
  };

  return Model.extend({

    urlRoot: '/planning/plans',

    clientUrlRoot: '#planning/plans',

    topicPrefix: 'planning.plans',

    privilegePrefix: 'PLANNING',

    nlsDomain: 'planning',

    initialize: function(attrs, options)
    {
      this.urlQuery = options && options.urlQuery || '';
      this.options = options && options.options;
      this.settings = options && options.settings;

      if (this.attributes.mrpFilter === null)
      {
        this.attributes.mrpFilter = JSON.parse(localStorage.getItem('PLANNING:MRP_FILTER') || '[]');
      }

      if (options && options.cache)
      {
        this.orders = new Collection(this.attributes.orders, {model: Model, paginate: false});
        this.lines = new Collection(this.attributes.lines, {model: Model, paginate: false});

        this.on('sync', this.cache.bind(this));
      }
    },

    cache: function()
    {
      this.orders.reset(this.attributes.orders);
      this.lines.reset(this.attributes.lines);
    },

    url: function()
    {
      return this.urlRoot + '/' + this.id + '?' + this.urlQuery;
    },

    parse: function(res)
    {
      res._id = time.utc.format(this.id, 'YYYY-MM-DD');

      return res;
    },

    getLabel: function()
    {
      return time.utc.format(this.id, 'LL');
    },

    getFilter: function()
    {
      return {
        date: time.utc.format(this.id, 'YYYY-MM-DD'),
        mrp: this.get('mrpFilter').join(',')
      };
    },

    setFilter: function(newFilter)
    {
      var attrs = {};

      if (newFilter.date)
      {
        attrs._id = newFilter.date;
        attrs.createdAt = null;
        attrs.updatedAt = null;
        attrs.orders = [];
        attrs.lines = [];

        this.settings.set({
          _id: newFilter.date
        });
      }

      if (newFilter.mrp)
      {
        attrs.mrpFilter = newFilter.mrp;

        localStorage.setItem('PLANNING:MRP_FILTER', JSON.stringify(newFilter.mrp));
      }

      this.set(attrs);
    },

    getOrderedMrps: function()
    {
      var mrpFilter = this.get('mrpFilter');

      if (mrpFilter.length)
      {
        return mrpFilter.slice();
      }

      return this.settings.get('mrps').map(function(mrp) { return mrp._id; }).sort(function(a, b)
      {
        return a.localeCompare(b, undefined, {numeric: true});
      });
    },

    serializeMrps: function()
    {
      return this.getOrderedMrps().map(function(mrpId) { return this.serializeMrp(mrpId); }, this);
    },

    serializeMrp: function(mrpId)
    {
      return new PlanMrp(this, mrpId);
    }

  });
});

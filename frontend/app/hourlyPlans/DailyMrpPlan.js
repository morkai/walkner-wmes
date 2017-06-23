// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'backbone',
  '../i18n',
  '../time',
  '../core/Model',
  '../data/orgUnits',
  '../mrpControllers/MrpController',
  './util/generateDailyMrpPlan',
  './DailyMrpPlanOrderCollection',
  './DailyMrpPlanLineCollection'
], function(
  _,
  Backbone,
  t,
  time,
  Model,
  orgUnits,
  MrpController,
  generateDailyMrpPlan,
  DailyMrpPlanOrderCollection,
  DailyMrpPlanLineCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/dailyMrpPlans',

    initialize: function(attrs, options)
    {
      this.settings = options && options.settings || this.collection.settings;

      /**
       * @private
       * @type {?Array<Object>}
       */
      this.updateQueue = null;

      /**
       * @type {Date}
       */
      this.date = new Date(attrs.date);

      /**
       * @type {Backbone.Model<MrpController>}
       */
      this.mrp = orgUnits.getByTypeAndId('mrpController', attrs.mrp)
        || new MrpController({_id: attrs.mrp, description: '?'});

      if (!this.id)
      {
        this.set('_id', this.constructor.generateId(this.date, this.mrp.id));
      }

      /**
       * @type {Backbone.Collection<DailyMrpPlanOrder>}
       */
      this.orders = new DailyMrpPlanOrderCollection(attrs.orders, {plan: this});

      /**
       * @type {Backbone.Collection<DailyMrpPlanLine>}
       */
      this.lines = new DailyMrpPlanLineCollection(attrs.lines, {plan: this});
    },

    toJSON: function()
    {
      return {
        _id: this.id,
        updatedAt: this.get('updatedAt'),
        date: this.date.toISOString(),
        mrp: this.mrp.id,
        orders: this.orders.toJSON(),
        lines: this.lines.toJSON()
      };
    },

    isEditable: function()
    {
      return Date.now() < (this.date.getTime() + 6 * 3600 * 1000);
    },

    importing: function()
    {
      this.updateQueue = [];
    },

    imported: function(newData)
    {
      if (newData.updatedAt > this.get('updatedAt'))
      {
        this.set('updatedAt', newData.updatedAt, {silent: true});

        this.orders.reset(newData.orders);
      }

      var updateQueue = this.updateQueue;

      this.updateQueue = null;

      _.forEach(updateQueue, this.update, this);
    },

    update: function(update)
    {
      if (this.updateQueue)
      {
        this.updateQueue.push(update);

        return;
      }

      if (update.updatedAt <= this.get('updatedAt'))
      {
        return;
      }

      var sameInstance = update.instanceId === window.INSTANCE_ID;

      this.attributes.updatedAt = update.updatedAt;

      switch (update.action)
      {
        case 'resetLines':
          if (!sameInstance)
          {
            this.lines.reset(update.data.lines, {skipGenerate: true});
          }
          break;

        case 'updateLine':
          var line = this.lines.get(update.data._id);

          if (line)
          {
            line.set(update.data);
          }
          break;

        case 'resetOrders':
          if (!sameInstance)
          {
            this.orders.reset(update.data.orders, {skipGenerate: true});
          }
          break;

        case 'updateOrder':
          var order = this.orders.get(update.data._id);

          if (order)
          {
            order.set(update.data);
          }
          break;
      }
    },

    saveLines: function()
    {
      var plan = this;

      if (!plan.isEditable())
      {
        return null;
      }

      var req = plan.collection.update('resetLines', plan.id, {
        lines: plan.lines.toJSON()
      });

      plan.trigger('request', this, req, {syncMethod: 'read'});

      req.fail(function()
      {
        plan.trigger('error');
      });

      req.done(function()
      {
        plan.trigger('sync');
      });

      return req;
    },

    generate: function()
    {
      if (this.isEditable()
        && generateDailyMrpPlan(this, this.settings.getPlanGeneratorSettings(this.lines.pluck('_id'))))
      {
        this.trigger('generated');
      }
    }

  }, {

    generateId: function(date, mrpId)
    {
      return time.getMoment(date).format('YYMMDD') + '-' + mrpId;
    }

  });
});

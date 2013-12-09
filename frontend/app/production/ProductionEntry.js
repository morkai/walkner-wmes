define([
  'underscore',
  'moment',
  '../time',
  '../socket',
  '../core/Model',
  '../data/workCenters',
  '../data/prodLines',
  '../data/prodLog',
  './ProdDowntime',
  './ProdDowntimeCollection',
  './ProdShiftOrder'
], function(
  _,
  moment,
  time,
  socket,
  Model,
  workCenters,
  prodLines,
  prodLog,
  ProdDowntime,
  ProdDowntimeCollection,
  ProdShiftOrder
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodShift',

    clientUrlRoot: '#prodShift',

    defaults: {
      prodLine: null,
      date: null,
      shift: null,
      state: null,
      quantitiesDone: null,
      creator: null,
      createdAt: null,
      master: null,
      leader: null,
      operator: null
    },

    initialize: function()
    {
      this.prodLine = prodLines.get(this.get('prodLine'));

      this.prodShiftOrder = new ProdShiftOrder();

      this.prodDowntimes = new ProdDowntimeCollection(null, {
        rqlQuery: 'sort(-startedAt)&limit(8)&prodLine=' + encodeURIComponent(this.prodLine.id)
      });
    },

    sync: function(method)
    {
      if (method === 'read')
      {
        return Model.prototype.sync.apply(this, arguments);
      }

      throw new Error("Method not supported: " + method);
    },

    startShiftChangeMonitor: function()
    {
      this.shiftChangeTimer = setTimeout(changeShift, this.getTimeToNextShift(), this);

      function changeShift(model)
      {
        model.startShiftChangeMonitor();
        model.changeShift();
      }
    },

    stopShiftChangeMonitor: function()
    {
      if (this.shiftChangeTimer != null)
      {
        clearTimeout(this.shiftChangeTimer);
        delete this.shiftChangeTimer;
      }
    },

    readLocalData: function()
    {
      var data = null;

      try
      {
        data = JSON.parse(localStorage.getItem(this.getDataStorageKey()));

        if (data.date)
        {
          data.date = new Date(data.date);
        }

        this.prodShiftOrder.clear();

        if (data.prodShiftOrder)
        {
          this.prodShiftOrder.set(data.prodShiftOrder);
        }

        this.prodDowntimes.reset(data.prodDowntimes || []);

        delete data.prodShiftOrder;
        delete data.prodDowntimes;
      }
      catch (err) {}

      if (data == null)
      {
        this.resetShift();
      }
      else
      {
        this.set(data);

        if (this.get('date').getTime() !== this.getCurrentShiftMoment().valueOf()
          || this.get('shift') !== this.getCurrentShift())
        {
          this.resetShift();
        }
      }
    },

    resetShift: function()
    {
      this.set('state', 'idle');
      this.prodShiftOrder.clear();
      this.changeShift();
    },

    changeShift: function()
    {
      var finishedProdShiftId = this.id;

      this.finishOrder();
      this.finishDowntime();

      this.prodShiftOrder.onShiftChanged();

      this.set({
        date: this.getCurrentShiftMoment().toDate(),
        shift: this.getCurrentShift(),
        state: 'idle',
        quantitiesDone: [
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0},
          {planned: 0, actual: 0}
        ],
        createdAt: time.getServerMoment().toDate(),
        master: null,
        leader: null,
        operator: null
      });

      this.set('_id', prodLog.generateId(this.get('createdAt'), this.prodLine.id));

      prodLog.record(this, 'changeShift', {
        finishedProdShiftId: finishedProdShiftId,
        startedProdShift: this.toJSON()
      });
    },

    changeMaster: function(userInfo)
    {
      this.set('master', userInfo);

      prodLog.record(this, 'changeMaster', userInfo);
    },

    changeLeader: function(userInfo)
    {
      this.set('leader', userInfo);

      prodLog.record(this, 'changeLeader', userInfo);
    },

    changeOperator: function(userInfo)
    {
      this.set('operator', userInfo);

      prodLog.record(this, 'changeOperator', userInfo);
    },

    changeQuantitiesDone: function(hour, newValue)
    {
      var quantitiesDone = this.get('quantitiesDone');

      if (!quantitiesDone[hour])
      {
        throw new Error("Invalid hour: " + hour);
      }

      quantitiesDone[hour].actual = newValue;

      this.trigger('change:quantitiesDone', this, {});

      prodLog.record(this, 'changeQuantitiesDone', {
        hour: hour,
        newValue: newValue
      });
    },

    changeOrder: function(orderInfo, operationNo)
    {
      this.finishOrder();

      this.set('state', 'working');

      this.prodShiftOrder.onOrderChanged(this, orderInfo, operationNo);

      prodLog.record(this, 'changeOrder', this.prodShiftOrder.toJSON());
    },

    continueOrder: function()
    {
      if (this.prodShiftOrder.id)
      {
        throw new Error("Cannot continue the order: an order is already started!");
      }

      if (!this.prodShiftOrder.hasOrderData())
      {
        throw new Error("Cannot continue the order: no order data!");
      }

      this.set('state', 'working');

      this.prodShiftOrder.onOrderContinued(this);

      prodLog.record(this, 'changeOrder', this.prodShiftOrder);
    },

    changeQuantityDone: function(newValue)
    {
      if (!this.prodShiftOrder.id)
      {
        throw new Error("Cannot change the quantity done: no prod shift order!");
      }

      this.prodShiftOrder.set('quantityDone', newValue);

      prodLog.record(this, 'changeQuantityDone', {
        newValue: newValue
      });
    },

    changeWorkerCount: function(newValue)
    {
      if (!this.prodShiftOrder.id)
      {
        throw new Error("Cannot change the worker count: no prod shift order!");
      }

      this.prodShiftOrder.set('workerCount', newValue);

      prodLog.record(this, 'changeWorkerCount', {
        newValue: newValue
      });
    },

    endDowntime: function()
    {
      if (!this.prodDowntimes.findFirstUnfinished())
      {
        throw new Error("Cannot end a downtime as there is none!");
      }

      this.finishDowntime();

      if (this.prodShiftOrder.id)
      {
        this.set('state', 'working');
      }
      else
      {
        this.set('state', 'idle');
      }
    },

    endWork: function()
    {
      this.finishOrder();
      this.finishDowntime();

      this.set('state', 'idle');

      this.prodShiftOrder.onWorkEnded();

      prodLog.record(this, 'endWork', {});
    },

    startDowntime: function(downtimeInfo)
    {
      var order = this.get('order');

      var prodDowntime = new ProdDowntime({
        prodLine: this.prodLine.id,
        prodShift: this.id,
        prodShiftOrder: order ? order._id : null,
        aor: downtimeInfo.aor,
        reason: downtimeInfo.reason,
        reasonComment: downtimeInfo.reasonComment,
        status: ProdDowntime.STATUS.UNDECIDED,
        startedAt: time.getServerMoment().toDate(),
        master: this.get('master'),
        leader: this.get('leader'),
        operator: this.get('operator')
      });

      prodDowntime.set(
        '_id',
        prodLog.generateId(prodDowntime.get('startedAt'), this.id + downtimeInfo.aor)
      );

      this.prodDowntimes.addFromInfo(this, downtimeInfo);

      this.set('state', 'downtime');

      prodLog.record(this, 'startDowntime', prodDowntime.toJSON());
    },

    finishOrder: function()
    {
      var finishedProdShiftOrder = this.prodShiftOrder.finish();

      if (finishedProdShiftOrder)
      {
        prodLog.record(this, 'finishOrder', finishedProdShiftOrder);
      }
    },

    finishDowntime: function()
    {
      var finishedProdDowntime = this.prodDowntimes.finish();

      if (finishedProdDowntime)
      {
        prodLog.record(this, 'finishDowntime', finishedProdDowntime);
      }
    },

    saveLocalData: function()
    {
      var data = this.toJSON();

      data.prodShiftOrder = this.prodShiftOrder.toJSON();
      data.prodDowntimes = this.prodDowntimes.toJSON();

      localStorage.setItem(this.getDataStorageKey(), JSON.stringify(data));
    },

    /**
     * @returns {string}
     */
    getLabel: function()
    {
      var description = this.prodLine.get('description');

      if (_.isString(description) && description.length)
      {
        return description;
      }

      return this.prodLine.id;
    },

    /**
     * @returns {string}
     */
    getCurrentTime: function()
    {
      return time.getServerMoment().format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * @returns {number}
     */
    getCurrentShift: function()
    {
      var hour = time.getServerMoment().hour();

      if (hour >= 6 && hour < 14)
      {
        return 1;
      }

      if (hour >= 14 && hour < 22)
      {
        return 2;
      }

      return 3;
    },

    /**
     * @return {moment}
     */
    getCurrentShiftMoment: function()
    {
      var currentMoment = time.getServerMoment();
      var hour = currentMoment.hour();

      if (hour >= 6 && hour < 14)
      {
        currentMoment.hours(6);
      }
      else if (hour >= 14 && hour < 22)
      {
        currentMoment.hours(14);
      }
      else
      {
        currentMoment.hours(22);

        if (hour < 6)
        {
          currentMoment.subtract('days', 1);
        }
      }

      return currentMoment.minutes(0).seconds(0).milliseconds(0);
    },

    /**
     * @returns {number}
     */
    getTimeToNextShift: function()
    {
      return this.getCurrentShiftMoment().add('hours', 8).diff(time.getServerMoment());
    },

    isIdle: function()
    {
      return this.get('state') === 'idle';
    },

    isDowntime: function()
    {
      return this.get('state') === 'downtime';
    },

    isWorking: function()
    {
      return this.get('state') === 'working';
    },

    /**
     * @returns {boolean}
     */
    isLocked: function()
    {
      return typeof localStorage.getItem(this.getSecretKeyStorageKey()) !== 'string';
    },

    /**
     * @returns {string|null}
     */
    getSecretKey: function()
    {
      var secretKey = localStorage.getItem(this.getSecretKeyStorageKey());

      return typeof secretKey === 'string' ? secretKey : null;
    },

    /**
     * @param {string|null} secretKey
     */
    setSecretKey: function(secretKey)
    {
      if (secretKey === null)
      {
        localStorage.removeItem(this.getSecretKeyStorageKey());

        this.trigger('locked');
      }
      else
      {
        localStorage.setItem(this.getSecretKeyStorageKey(), secretKey);

        this.trigger('unlocked');
      }
    },

    /**
     * @private
     * @returns {string}
     */
    getSecretKeyStorageKey: function()
    {
      return 'PRODUCTION:SECRET_KEY:' + this.prodLine.id;
    },

    /**
     * @private
     * @returns {string}
     */
    getDataStorageKey: function()
    {
      return 'PRODUCTION:DATA:' + this.prodLine.id;
    }

  }, {

    STATE: {
      IDLE: 'idle',
      WORKING: 'working',
      DOWNTIME: 'downtime'
    }

  });

});

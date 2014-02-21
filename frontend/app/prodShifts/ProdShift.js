define([
  'underscore',
  '../user',
  '../time',
  '../socket',
  '../core/Model',
  '../core/util/getShiftStartInfo',
  '../data/subdivisions',
  '../data/workCenters',
  '../data/prodLines',
  '../data/prodLog',
  '../prodDowntimes/ProdDowntime',
  '../prodDowntimes/ProdDowntimeCollection',
  '../prodShiftOrders/ProdShiftOrder'
], function(
  _,
  user,
  time,
  socket,
  Model,
  getShiftStartInfo,
  subdivisions,
  workCenters,
  prodLines,
  prodLog,
  ProdDowntime,
  ProdDowntimeCollection,
  ProdShiftOrder
) {
  'use strict';

  // TODO: Sync with the latest entry on unlock

  return Model.extend({

    urlRoot: '/prodShifts',

    clientUrlRoot: '#prodShifts',

    topicPrefix: 'prodShifts',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodShifts',

    defaults: {
      division: null,
      subdivision: null,
      mrpControllers: null,
      prodFlow: null,
      workCenter: null,
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

    initialize: function(attributes, options)
    {
      if (options && options.production)
      {
        this.prodLine = prodLines.get(this.get('prodLine'));

        this.prodShiftOrder = new ProdShiftOrder();

        this.prodDowntimes = new ProdDowntimeCollection(null, {
          paginate: false,
          rqlQuery: 'sort(-startedAt)&limit(8)&prodLine=' + encodeURIComponent(this.prodLine.id)
        });
      }
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
        model.changeShift();
        model.startShiftChangeMonitor();
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
      if (this.isLocked())
      {
        return;
      }

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

      if (_.isEmpty(data))
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

    saveLocalData: function()
    {
      if (this.isLocked())
      {
        return;
      }

      var data = this.toJSON();

      delete data.division;
      delete data.subdivision;
      delete data.mrpControllers;
      delete data.prodFlow;
      delete data.workCenter;
      delete data.prodLine;

      data.prodShiftOrder = this.prodShiftOrder.toJSON();
      data.prodDowntimes = this.prodDowntimes.toJSON();

      localStorage.setItem(this.getDataStorageKey(), JSON.stringify(data));
    },

    resetShift: function()
    {
      this.set('state', 'idle');
      this.changeShift();
    },

    changeShift: function()
    {
      var newDate = this.getCurrentShiftMoment().toDate();
      var oldDate = this.get('date');

      if (oldDate && newDate.getTime() === oldDate.getTime())
      {
        return;
      }

      var finishedProdShiftId = this.id || null;

      this.finishDowntime();
      this.finishOrder();

      this.prodShiftOrder.onShiftChanged();

      this.set({
        date: newDate,
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
        creator: user.getInfo(),
        createdAt: time.getMoment().toDate(),
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

    changeCurrentQuantitiesDone: function(newValue)
    {
      this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(), newValue);
    },

    changeQuantitiesDone: function(hour, newValue)
    {
      if (typeof newValue !== 'number' || isNaN(newValue))
      {
        newValue = 0;
      }

      var quantitiesDone = this.get('quantitiesDone');

      if (!quantitiesDone[hour])
      {
        throw new Error("Invalid hour: " + hour);
      }

      if (quantitiesDone[hour].actual === newValue)
      {
        return;
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

    correctOrder: function(orderInfo, operationNo)
    {
      if (!this.hasOrder())
      {
        throw new Error("Cannot correct the order: no order is started!");
      }

      var changes = this.prodShiftOrder.onOrderCorrected(this, orderInfo, operationNo);

      if (changes)
      {
        prodLog.record(this, 'correctOrder', changes);
      }
    },

    continueOrder: function()
    {
      if (this.hasOrder())
      {
        throw new Error("Cannot continue the order: an order is already started!");
      }

      if (!this.prodShiftOrder.hasOrderData())
      {
        throw new Error("Cannot continue the order: no order data!");
      }

      this.set('state', 'working');

      this.prodShiftOrder.onOrderContinued(this);

      prodLog.record(this, 'changeOrder', this.prodShiftOrder.toJSON());
    },

    changeQuantityDone: function(newValue)
    {
      if (!this.hasOrder())
      {
        throw new Error("Cannot change the quantity done: no prod shift order!");
      }

      if (typeof newValue !== 'number' || isNaN(newValue))
      {
        newValue = 0;
      }

      if (newValue === this.prodShiftOrder.get('quantityDone'))
      {
        return;
      }

      this.prodShiftOrder.set('quantityDone', newValue);

      prodLog.record(this, 'changeQuantityDone', {
        newValue: newValue
      });
    },

    changeWorkerCount: function(newValue)
    {
      if (!this.hasOrder())
      {
        throw new Error("Cannot change the worker count: no prod shift order!");
      }

      if (typeof newValue !== 'number' || isNaN(newValue))
      {
        newValue = 0;
      }

      if (newValue === this.prodShiftOrder.get('workerCount'))
      {
        return;
      }

      this.prodShiftOrder.set('workerCount', newValue);

      prodLog.record(this, 'changeWorkerCount', {
        newValue: newValue
      });
    },

    endDowntime: function()
    {
      if (this.hasOrder())
      {
        this.set('state', 'working');
      }
      else
      {
        this.set('state', 'idle');
      }

      if (!this.finishDowntime())
      {
        this.saveLocalData();
      }
    },

    endWork: function()
    {
      this.finishDowntime();
      this.finishOrder();

      this.set('state', 'idle');

      this.prodShiftOrder.onWorkEnded();

      prodLog.record(this, 'endWork', {});
    },

    startDowntime: function(downtimeInfo, startedAt)
    {
      var prodDowntime = this.prodDowntimes.addFromInfo(this, downtimeInfo, startedAt);

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

      return !!finishedProdDowntime;
    },

    /**
     * @returns {boolean}
     */
    hasOrder: function()
    {
      return !!this.prodShiftOrder.id;
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
      return time.getMoment().format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * @returns {number}
     */
    getCurrentShift: function()
    {
      var hour = time.getMoment().hour();

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
      return getShiftStartInfo(Date.now()).moment;
    },

    /**
     * @returns {number}
     */
    getTimeToNextShift: function()
    {
      return this.getCurrentShiftMoment().add('hours', 8).diff(time.getMoment());
    },

    /**
     * @returns {number}
     */
    getCurrentQuantityDoneHourIndex: function()
    {
      var hour = time.getMoment().hours();

      if (hour >= 6 && hour < 14)
      {
        return hour - 6;
      }

      if (hour >= 14 && hour < 22)
      {
        return hour - 14;
      }

      if (hour === 22)
      {
        return 0;
      }

      if (hour === 23)
      {
        return 1;
      }

      return hour + 2;
    },

    /**
     * @returns {string}
     */
    getCurrentQuantityDoneHourRange: function()
    {
      var fromMoment = time.getMoment().minutes(0).seconds(0);
      var from = fromMoment.format('HH:mm:ss');
      var to = fromMoment.minutes(59).seconds(59).format('HH:mm:ss');

      return from + '-' + to;
    },

    /**
     * @returns {number}
     */
    getQuantityDoneInCurrentHour: function()
    {
      var quantitiesDone = this.get('quantitiesDone');

      if (!Array.isArray(quantitiesDone))
      {
        return 0;
      }

      var hourIndex = this.getCurrentQuantityDoneHourIndex();

      if (hourIndex >= quantitiesDone.length)
      {
        return 0;
      }

      return quantitiesDone[hourIndex].actual;
    },

    getOrderIdType: function()
    {
      var subdivision = subdivisions.get(this.get('subdivision'));

      return subdivision && subdivision.get('type') === 'press' ? 'nc12' : 'no';
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

    getMaxQuantitiesDone: function()
    {
      return 150;
    },

    getBreakReason: function()
    {
      // TODO: Make configurable
      return 'A';
    },

    getDefaultAor: function()
    {
      var subdivision = this.prodLine.getSubdivision();

      return subdivision ? subdivision.get('aor') : null;
    },

    /**
     * @returns {boolean}
     */
    isLocked: function()
    {
      return this.getSecretKey() === null;
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
        localStorage.removeItem(this.getDataStorageKey());

        this.prodShiftOrder.clear();
        this.prodDowntimes.reset();
        this.clear();
        this.trigger('locked');
      }
      else
      {
        localStorage.setItem(this.getSecretKeyStorageKey(), secretKey);

        this.trigger('unlocked');
        this.readLocalData();
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

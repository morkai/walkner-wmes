// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../user',
  '../time',
  '../socket',
  '../core/Model',
  '../core/util/getShiftStartInfo',
  '../data/downtimeReasons',
  '../data/subdivisions',
  '../data/workCenters',
  '../data/prodFlows',
  '../data/prodLines',
  '../data/prodLog',
  '../prodDowntimes/ProdDowntime',
  '../prodDowntimes/ProdDowntimeCollection',
  '../prodShiftOrders/ProdShiftOrder',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  user,
  time,
  socket,
  Model,
  getShiftStartInfo,
  downtimeReasons,
  subdivisions,
  workCenters,
  prodFlows,
  prodLines,
  prodLog,
  ProdDowntime,
  ProdDowntimeCollection,
  ProdShiftOrder,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodShifts',

    clientUrlRoot: '#prodShifts',

    topicPrefix: 'prodShifts',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodShifts',

    defaults: function()
    {
      return {
        division: null,
        subdivision: null,
        mrpControllers: null,
        prodFlow: null,
        workCenter: null,
        prodLine: null,
        date: null,
        shift: null,
        state: null,
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
        creator: null,
        createdAt: null,
        master: null,
        leader: null,
        operator: null,
        operators: null
      };
    },

    initialize: function(attributes, options)
    {
      if (options && options.production)
      {
        this.shiftChangeTimer = null;

        this.prodLine = prodLines.get(this.get('prodLine'));

        this.prodShiftOrder = new ProdShiftOrder();

        this.prodDowntimes = new ProdDowntimeCollection(null, {
          paginate: false,
          rqlQuery: 'sort(-startedAt)&limit(8)&prodLine=' + encodeURIComponent(this.prodLine.id)
        });
      }
    },

    serialize: function(options)
    {
      var prodShift = this.toJSON();

      prodShift.createdAt = time.format(prodShift.createdAt, 'YYYY-MM-DD HH:mm:ss');
      prodShift.creator = renderUserInfo({userInfo: prodShift.creator});

      prodShift.date = time.format(prodShift.date, 'YYYY-MM-DD');
      prodShift.shift = prodShift.shift ? t('core', 'SHIFT:' + prodShift.shift) : '?';

      if (options.orgUnits)
      {
        var subdivision = subdivisions.get(prodShift.subdivision);
        var prodFlow = prodFlows.get(prodShift.prodFlow);

        prodShift.subdivision = subdivision ? subdivision.getLabel() : '?';
        prodShift.prodFlow = prodFlow ? prodFlow.getLabel() : '?';
        prodShift.mrpControllers = Array.isArray(prodShift.mrpControllers) && prodShift.mrpControllers.length
          ? prodShift.mrpControllers.join('; ')
          : '?';
      }

      if (options.personnel)
      {
        prodShift.master = renderUserInfo({userInfo: prodShift.master});
        prodShift.leader = renderUserInfo({userInfo: prodShift.leader});
        prodShift.operator = renderUserInfo({userInfo: prodShift.operator});
      }

      return prodShift;
    },

    startShiftChangeMonitor: function()
    {
      this.stopShiftChangeMonitor();

      this.shiftChangeTimer = setTimeout(function(prodShift)
      {
        prodShift.shiftChangeTimer = null;
        prodShift.changeShift();
        prodShift.startShiftChangeMonitor();
      }, 1000, this);
    },

    stopShiftChangeMonitor: function()
    {
      if (this.shiftChangeTimer !== null)
      {
        clearTimeout(this.shiftChangeTimer);
        this.shiftChangeTimer = null;
      }
    },

    readLocalData: function(remoteData)
    {
      if (this.isLocked())
      {
        return;
      }

      var data = null;

      try
      {
        data = this.constructor.parse(
          remoteData ? remoteData : JSON.parse(localStorage.getItem(this.getDataStorageKey()))
        );

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

      if (!_.isEmpty(data))
      {
        if (this.prodDowntimes.findFirstUnfinished())
        {
          data.state = 'downtime';
        }
        else if (this.prodShiftOrder.id)
        {
          data.state = 'working';
        }
        else
        {
          data.state = 'idle';
        }

        this.set(data);
      }

      this.changeShift();
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

    changeShift: function()
    {
      var newDate = this.getCurrentShiftMoment().toDate();
      var oldDate = this.get('date');

      if (oldDate && newDate.getTime() <= oldDate.getTime())
      {
        return this.startShiftChangeMonitor();
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
        createdAt: new Date(),
        master: null,
        leader: null,
        operator: null,
        operators: null
      });

      this.set('_id', prodLog.generateId(this.get('createdAt'), this.prodLine.id));

      prodLog.record(this, 'changeShift', {
        finishedProdShiftId: finishedProdShiftId,
        startedProdShift: this.toJSON()
      });

      this.startShiftChangeMonitor();
    },

    changeMaster: function(userInfo)
    {
      this.set('master', userInfo);

      this.onPersonnelChanged('master');

      prodLog.record(this, 'changeMaster', userInfo);
    },

    changeLeader: function(userInfo)
    {
      this.set('leader', userInfo);

      this.onPersonnelChanged('leader');

      prodLog.record(this, 'changeLeader', userInfo);
    },

    changeOperator: function(userInfo)
    {
      this.set('operator', userInfo);

      this.onPersonnelChanged('operator');

      prodLog.record(this, 'changeOperator', userInfo);
    },

    onPersonnelChanged: function(type)
    {
      var personnelInfo = this.get(type);

      if (this.prodShiftOrder.id)
      {
        this.prodShiftOrder.set(type, personnelInfo);
      }

      var prodDowntime = this.prodDowntimes.findFirstUnfinished();

      if (prodDowntime)
      {
        prodDowntime.set(type, personnelInfo);
      }

      if (type === 'operator' && this.getSubdivisionType() === 'assembly')
      {
        this.set('operators', personnelInfo ? [personnelInfo] : null);
        this.onPersonnelChanged('operators');
      }
    },

    changeCurrentQuantitiesDone: function(newValue)
    {
      this.changeQuantitiesDone(this.getCurrentQuantityDoneHourIndex(), newValue);
    },

    changeQuantitiesDone: function(hour, newValue, options)
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

      this.trigger('change:quantitiesDone', this, quantitiesDone, options || {});

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

    startDowntime: function(downtimeInfo)
    {
      var prodDowntime = this.prodDowntimes.addFromInfo(this, downtimeInfo);

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

    editDowntime: function(prodDowntime, changes)
    {
      prodDowntime.set(changes);

      changes = prodDowntime.changedAttributes();

      if (!changes)
      {
        return;
      }

      changes._id = prodDowntime.id;

      prodLog.record(this, 'editDowntime', changes);
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
      var label = this.get('prodLine');
      var date = this.get('date');
      var shift = this.get('shift');

      if (date && shift)
      {
        label += ': ' + time.format(this.get('date'), 'YYYY-MM-DD');
        label += ', ' + t('core', 'SHIFT:' + this.get('shift'));
      }

      return label;
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
      return this.getCurrentShiftMoment().add(8, 'hours').diff(time.getMoment());
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
      return this.getSubdivisionType() === 'press' ? 'nc12' : 'no';
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

    getSubdivisionType: function()
    {
      var subdivision = subdivisions.get(this.get('subdivision'));

      return subdivision ? subdivision.get('type') : null;
    },

    getDowntimeReasons: function()
    {
      return downtimeReasons.findBySubdivisionType(this.getSubdivisionType());
    },

    getBreakReason: function()
    {
      return downtimeReasons.findFirstBreakIdBySubdivisionType(this.getSubdivisionType());
    },

    getDefaultAor: function()
    {
      var subdivision = this.prodLine.getSubdivision();

      return subdivision ? subdivision.get('aor') : null;
    },

    hasEnded: function()
    {
      var prodShiftStartTime = time.getMoment(this.get('date')).valueOf();
      var currentShiftStartTime = getShiftStartInfo(new Date()).moment.valueOf();

      return prodShiftStartTime < currentShiftStartTime;
    },

    updatePlannedQuantities: function(plannedQuantities)
    {
      if (!Array.isArray(plannedQuantities)
        || plannedQuantities.length !== 8
        || !Array.isArray(this.attributes.quantitiesDone))
      {
        return;
      }

      for (var h = 0; h < 8; ++h)
      {
        this.attributes.quantitiesDone[h].planned = plannedQuantities[h];
      }

      this.saveLocalData();
      this.trigger('change:quantitiesDone', this, this.attributes.quantitiesDone, {});
    },

    /**
     * @returns {boolean}
     */
    isLocked: function()
    {
      return !prodLog.isEnabled() || this.getSecretKey() === null;
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
     * @param {object} [remoteData]
     */
    setSecretKey: function(secretKey, remoteData)
    {
      if (secretKey === null)
      {
        localStorage.removeItem(this.getSecretKeyStorageKey());
        localStorage.removeItem(this.getDataStorageKey());

        this.prodShiftOrder.clear();
        this.prodDowntimes.reset();
        this.stopShiftChangeMonitor();
        this.set({
          date: null,
          shift: null,
          state: null,
          quantitiesDone: null,
          creator: null,
          createdAt: null,
          master: null,
          leader: null,
          operator: null,
          operators: null
        });
        this.trigger('locked');
      }
      else
      {
        localStorage.setItem(this.getSecretKeyStorageKey(), secretKey);

        this.trigger('unlocked');
        this.readLocalData(remoteData);
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
    },

    parse: function(data)
    {
      if (typeof data.date === 'string')
      {
        data.date = new Date(data.date);
      }

      return data;
    }

  });

});

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../i18n',
  '../user',
  '../time',
  '../socket',
  '../viewport',
  '../core/Model',
  '../core/util/getShiftStartInfo',
  '../data/downtimeReasons',
  '../data/subdivisions',
  '../data/workCenters',
  '../data/prodFlows',
  '../data/prodLines',
  '../data/prodLog',
  '../data/localStorage',
  '../prodLines/ProdLine',
  '../prodDowntimes/ProdDowntime',
  '../prodDowntimes/ProdDowntimeCollection',
  '../prodShiftOrders/ProdShiftOrder',
  '../prodShiftOrders/ProdShiftOrderCollection',
  '../isa/IsaRequestCollection',
  '../production/settings',
  '../production/snManager',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  t,
  user,
  time,
  socket,
  viewport,
  Model,
  getShiftStartInfo,
  downtimeReasons,
  subdivisions,
  workCenters,
  prodFlows,
  prodLines,
  prodLog,
  localStorage,
  ProdLine,
  ProdDowntime,
  ProdDowntimeCollection,
  ProdShiftOrder,
  ProdShiftOrderCollection,
  IsaRequestCollection,
  settings,
  snManager,
  renderUserInfo
) {
  'use strict';

  var LINE_STORAGE_KEY = 'PRODUCTION:LINE';

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
      if (!options || !options.production)
      {
        return;
      }

      this.prodLine = prodLines.get(this.get('prodLine'));

      if (!this.prodLine)
      {
        this.prodLine = new ProdLine({
          _id: null
        });
      }

      this.shiftChangeTimer = null;

      this.settings = settings.acquire({localStorage: true});

      this.prodShiftOrder = new ProdShiftOrder(null, {
        settings: this.settings
      });

      this.prodDowntimes = new ProdDowntimeCollection(null, {
        paginate: false,
        rqlQuery: 'sort(-startedAt)&limit(8)&prodLine=' + encodeURIComponent(this.prodLine.id)
      });

      this.isaRequests = IsaRequestCollection.activeForLine(this.prodLine.id);
    },

    serialize: function(options)
    {
      var prodShift = this.toJSON();

      prodShift.createdAt = time.format(prodShift.createdAt, 'LL, LTS');
      prodShift.creator = renderUserInfo({userInfo: prodShift.creator});

      prodShift.date = time.format(prodShift.date, 'L');
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
        prodShift.trigger('second');
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
          this.prodShiftOrder.set(ProdShiftOrder.parse(data.prodShiftOrder));
        }

        this.prodDowntimes.reset((data.prodDowntimes || []).map(ProdDowntime.parse), {silent: true});

        delete data.prodShiftOrder;
        delete data.prodDowntimes;
      }
      catch (err) {} // eslint-disable-line no-empty

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

      if (this.prodDowntimes.length)
      {
        this.prodDowntimes.trigger('reset');
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

      if (socket.isConnected())
      {
        return this.startNewShiftIfNecessary(newDate);
      }

      this.startNewShift(newDate);
    },

    /**
     * @private
     * @param {Date} newDate
     */
    startNewShiftIfNecessary: function(newDate)
    {
      var prodShift = this;

      this.findExistingShift(newDate, function(remoteData)
      {
        if (remoteData)
        {
          prodShift.readLocalData(remoteData);
        }
        else
        {
          prodShift.startNewShift(newDate);
        }
      });
    },

    /**
     * @private
     * @param {Date} newDate
     * @param {function((object|null))} done
     */
    findExistingShift: function(newDate, done)
    {
      var prodShift = this;
      var req = $.ajax({
        url: '/prodShifts?prodLine=' + this.get('prodLine') + '&date=' + newDate.getTime()
      });

      req.fail(function()
      {
        prodShift.startNewShift(newDate);
      });

      req.done(function(res)
      {
        if (!res || !res.totalCount || !Array.isArray(res.collection))
        {
          return prodShift.startNewShift(newDate);
        }

        var prodShiftData = res.collection[0];

        prodShiftData.nextOrder = null;

        var ordersReq = $.ajax({
          url: '/prodShiftOrders?prodShift=' + prodShiftData._id + '&finishedAt=null&sort(-startedAt)'
        });
        var downtimesReq = $.ajax({
          url: '/prodDowntimes?prodLine=' + prodShiftData.prodLine + '&sort(-startedAt)&limit(8)'
        });

        req = $.when(ordersReq, downtimesReq);

        req.fail(function()
        {
          prodShift.startNewShift(newDate);
        });

        req.done(function(ordersArgs, downtimesArgs)
        {
          var orders = ordersArgs[0].collection;
          var downtimes = downtimesArgs[0].collection;

          prodShiftData.prodShiftOrder = orders && orders[0] ? orders[0] : null;
          prodShiftData.prodDowntimes = Array.isArray(downtimes) ? downtimes : [];

          done(prodShiftData);
        });
      });
    },

    /**
     * @private
     * @param {Date} newDate
     */
    startNewShift: function(newDate)
    {
      snManager.clear();

      var finishedProdShiftId = this.id || null;

      this.finishDowntime(false);
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
        operators: null,
        nextOrder: null
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
      this.changePersonnel('changeMaster', 'master', userInfo);
    },

    changeLeader: function(userInfo)
    {
      this.changePersonnel('changeLeader', 'leader', userInfo);
    },

    changeOperator: function(userInfo)
    {
      this.changePersonnel('changeOperator', 'operator', userInfo);
    },

    changePersonnel: function(operation, personnelType, newUserInfo)
    {
      var currentUserInfo = this.get(personnelType);

      if (currentUserInfo === newUserInfo
        || (currentUserInfo && newUserInfo && currentUserInfo.id === newUserInfo.id))
      {
        return;
      }

      this.set(personnelType, newUserInfo);

      this.onPersonnelChanged(personnelType);

      prodLog.record(this, operation, newUserInfo);
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
        throw new Error('Invalid hour: ' + hour);
      }

      if (quantitiesDone[hour].actual === newValue)
      {
        return;
      }

      quantitiesDone[hour].actual = newValue;

      this.trigger('change:quantitiesDone', this, quantitiesDone, options || {});

      if (!options || options.record !== false)
      {
        prodLog.record(this, 'changeQuantitiesDone', {
          hour: hour,
          newValue: newValue
        });
      }
    },

    changeOrder: function(orderInfo, operationNo, workerCount)
    {
      var createdAt = Date.now();

      this.finishOrder(new Date(createdAt - 1));

      this.set({
        state: 'working',
        nextOrder: this.getNextOrders().filter(function(next) { return next.order.no !== orderInfo.no; })
      });

      var prevOrderNo = this.prodShiftOrder.get('orderId');

      this.prodShiftOrder.onOrderChanged(this, orderInfo, operationNo, workerCount > 0 ? workerCount : 0);

      prodLog.record(this, 'changeOrder', this.prodShiftOrder.toJSON(), new Date(createdAt));

      if (prevOrderNo !== this.prodShiftOrder.get('orderId'))
      {
        this.autoStartDowntime();
      }
    },

    correctOrder: function(orderInfo, operationNo)
    {
      if (!this.hasOrder())
      {
        throw new Error('Cannot correct the order: no order is started!');
      }

      var changes = this.prodShiftOrder.onOrderCorrected(this, orderInfo, operationNo);

      if (!changes)
      {
        return;
      }

      prodLog.record(this, 'correctOrder', changes);

      this.trigger('orderCorrected');
    },

    setNextOrder: function(newNextOrders)
    {
      if (!this.hasOrder())
      {
        throw new Error('Cannot set the next order: no order is started!');
      }

      var oldNextOrders = this.get('nextOrder');
      var reset = _.isEmpty(newNextOrders);

      if (reset && _.isEmpty(oldNextOrders))
      {
        return;
      }

      var oldList = !oldNextOrders
        ? []
        : oldNextOrders.map(function(next) { return {orderNo: next.order.no, operationNo: next.operationNo}; });
      var newList = !newNextOrders
        ? []
        : newNextOrders.map(function(next) { return {orderNo: next.order.no, operationNo: next.operationNo}; });

      if (_.isEqual(newList, oldList))
      {
        return;
      }

      if (reset)
      {
        newNextOrders = [];
        newList = [];
      }

      this.set('nextOrder', newNextOrders);

      prodLog.record(this, 'setNextOrder', {orders: newList});
    },

    continueOrder: function()
    {
      if (this.hasOrder())
      {
        throw new Error('Cannot continue the order: an order is already started!');
      }

      if (!this.prodShiftOrder.hasOrderData())
      {
        throw new Error('Cannot continue the order: no order data!');
      }

      this.set('state', 'working');

      this.prodShiftOrder.onOrderContinued(this);

      prodLog.record(this, 'changeOrder', this.prodShiftOrder.toJSON());
    },

    changeQuantityDone: function(newValue)
    {
      if (!this.hasOrder())
      {
        throw new Error('Cannot change the quantity done: no prod shift order!');
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
        throw new Error('Cannot change the worker count: no prod shift order!');
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
      this.prodShiftOrder.set('sapTaktTime', this.prodShiftOrder.getSapTaktTime());

      prodLog.record(this, 'changeWorkerCount', {
        newValue: newValue,
        sapTaktTime: this.prodShiftOrder.get('sapTaktTime')
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

      var downtime = this.prodDowntimes.findFirstUnfinished();

      if (!this.finishDowntime())
      {
        this.saveLocalData();
      }
      else
      {
        this.startNextAutoDowntime(downtime);
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
      if (this.get('state') !== 'working')
      {
        return;
      }

      var prodDowntime = this.prodDowntimes.addFromInfo(this, downtimeInfo);

      this.set('state', 'downtime');

      prodLog.record(this, 'startDowntime', prodDowntime.toJSON());
    },

    finishOrder: function(createdAt)
    {
      var finishedProdShiftOrder = this.prodShiftOrder.finish();

      if (!finishedProdShiftOrder)
      {
        return false;
      }

      prodLog.record(this, 'finishOrder', finishedProdShiftOrder, createdAt);

      return true;
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

    isTaktTimeEnabled: function()
    {
      return !this.isLocked() && this.settings.isTaktTimeEnabled(this.prodLine.id);
    },

    updateTaktTimeLocally: function(logEntry)
    {
      this.updateTaktTime(snManager.getLocalTaktTime(
        logEntry.data,
        this.prodShiftOrder,
        this.getCurrentQuantityDoneHourIndex()
      ));

      prodLog.record(this, logEntry);
    },

    updateTaktTime: function(data)
    {
      snManager.add(data.serialNumber);

      var quantitiesDone = this.get('quantitiesDone');

      quantitiesDone[data.hourlyQuantityDone.index].actual = data.hourlyQuantityDone.value;

      this.trigger('change:quantitiesDone', this, quantitiesDone, {});

      if (!data.serialNumber.prodShiftOrder || data.serialNumber.prodShiftOrder === this.prodShiftOrder.id)
      {
        this.prodShiftOrder.set({
          quantityDone: data.quantityDone,
          lastTaktTime: data.lastTaktTime,
          avgTaktTime: data.avgTaktTime
        });
      }

      this.saveLocalData();
    },

    checkSpigot: function(component, nc12)
    {
      var prodDowntime;
      var spigot = this.prodShiftOrder.get('spigot');
      var final = false;

      if (!component)
      {
        if (!spigot)
        {
          return true;
        }

        prodDowntime = spigot.prodDowntime;
        component = spigot.component;
        final = true;
      }
      else if (spigot)
      {
        prodDowntime = spigot.prodDowntime;
      }
      else
      {
        prodDowntime = this.prodDowntimes.findFirstUnfinished().id;
      }

      var valid = this.checkSpigotValidity(nc12, component.nc12);

      if (valid)
      {
        this.prodShiftOrder.set('spigot', {
          prodDowntime: prodDowntime,
          component: component,
          initial: true,
          final: final
        });
      }

      prodLog.record(this, 'checkSpigot', {
        final: final,
        valid: valid,
        nc12: nc12,
        component: component,
        prodDowntime: prodDowntime
      });

      return valid;
    },

    checkSpigotValidity: function(userNc12, componentNc12)
    {
      if (userNc12 === componentNc12)
      {
        return true;
      }

      var spigotGroups = {};

      (this.settings.getValue('spigotGroups') || '').split('\n').forEach(function(spigotGroup)
      {
        var parts = spigotGroup.split(':');
        var parent = parts[0].trim();
        var children = parts[1].split(', ');

        children.forEach(function(child)
        {
          spigotGroups[child.trim()] = parent;
        });
      });

      return userNc12 === spigotGroups[componentNc12];
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
      var label = this.get('prodLine') || '?';
      var date = this.get('date');
      var shift = this.get('shift');

      if (date && shift)
      {
        label += ': ' + time.format(this.get('date'), 'L');
        label += ', ' + t('core', 'SHIFT:' + this.get('shift'));
      }

      return label;
    },

    /**
     * @returns {string}
     */
    getCurrentTime: function()
    {
      return time.getMoment().format('L, LTS');
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
     * @returns {moment}
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
      var from = fromMoment.format('LTS');
      var to = fromMoment.minutes(59).seconds(59).format('LTS');

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

    isSpigotLine: function()
    {
      return (this.settings.getValue('spigotLines') || '').split(',').indexOf(this.prodLine.id) !== -1;
    },

    getSpigotComponent: function()
    {
      return this.prodShiftOrder.getSpigotComponent(
        this.settings.getValue('spigotPatterns'),
        this.settings.getValue('spigotNotPatterns')
      );
    },

    getNextOrders: function()
    {
      var nextOrders = this.get('nextOrder') || [];

      if (!Array.isArray(nextOrders) && !_.isEmpty(nextOrders))
      {
        nextOrders = [{
          order: nextOrders.orderInfo,
          operationNo: nextOrders.operationNo
        }];
      }

      return nextOrders;
    },

    hasEnded: function()
    {
      var prodShiftStartTime = time.getMoment(this.get('date')).valueOf();
      var currentShiftStartTime = getShiftStartInfo(new Date()).moment.valueOf();

      return prodShiftStartTime < currentShiftStartTime;
    },

    updateQuantities: function(planned, actual)
    {
      var quantitiesDone = this.attributes.quantitiesDone;

      if (!Array.isArray(planned)
        || planned.length !== 8
        || !Array.isArray(quantitiesDone))
      {
        return;
      }

      for (var h = 0; h < 8; ++h)
      {
        quantitiesDone[h].planned = planned[h];
        quantitiesDone[h].actual = actual[h];
      }

      this.saveLocalData();
      this.trigger('change:quantitiesDone', this, this.attributes.quantitiesDone, {});
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
      return !prodLog.isEnabled() || !this.prodLine || this.getSecretKey() === null;
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
     * @param {Object} [remoteData]
     * @param {boolean} [reload]
     */
    setSecretKey: function(secretKey, remoteData, reload)
    {
      if (secretKey === null)
      {
        localStorage.removeItem(this.getSecretKeyStorageKey());
        localStorage.removeItem(this.getDataStorageKey());
        localStorage.removeItem(LINE_STORAGE_KEY);

        this.prodShiftOrder.clear();
        this.prodDowntimes.reset();
        this.stopShiftChangeMonitor();
        this.set({
          prodLine: null,
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
        localStorage.setItem(this.getSecretKeyStorageKey(remoteData.prodLine), secretKey);

        if (remoteData.prodLine)
        {
          localStorage.setItem(LINE_STORAGE_KEY, remoteData.prodLine);
        }

        if (!reload)
        {
          this.trigger('unlocked');
        }

        this.readLocalData(remoteData);

        if (reload)
        {
          window.location.reload();
        }
      }
    },

    /**
     * @private
     * @param {string} [prodLine]
     * @returns {string}
     */
    getSecretKeyStorageKey: function(prodLine)
    {
      return 'PRODUCTION:SECRET_KEY:' + (prodLine || this.prodLine.id);
    },

    /**
     * @private
     * @param {string} [prodLine]
     * @returns {string}
     */
    getDataStorageKey: function(prodLine)
    {
      return 'PRODUCTION:DATA:' + (prodLine || this.prodLine.id);
    },

    /**
     * @private
     */
    autoStartDowntime: function()
    {
      var aor = this.getDefaultAor();
      var subdivision = subdivisions.get(this.get('subdivision'));

      if (!aor || !subdivision)
      {
        return;
      }

      var autoDowntimes = this.settings.getAutoDowntimes(this.prodLine.id);

      if (_.isEmpty(autoDowntimes))
      {
        autoDowntimes = subdivision.get('autoDowntimes');
      }

      if (_.isEmpty(autoDowntimes))
      {
        return;
      }

      var autoDowntime;

      if (this.isBetweenInitialDowntimeWindow(Date.now()))
      {
        autoDowntime = _.find(autoDowntimes, function(autoDowntime) { return autoDowntime.when === 'initial'; });
      }

      if (!autoDowntime)
      {
        autoDowntime = _.find(autoDowntimes, function(autoDowntime) { return autoDowntime.when === 'always'; });
      }

      if (!autoDowntime)
      {
        return;
      }

      var downtimeReason = downtimeReasons.get(autoDowntime.reason);

      if (!downtimeReason)
      {
        return;
      }

      this.startDowntime({
        aor: aor,
        reason: downtimeReason.id,
        reasonComment: '',
        auto: {}
      });
    },

    /**
     * @private
     * @param {ProdDowntime} [prevDowntime]
     */
    startNextAutoDowntime: function(prevDowntime)
    {
      if (!prevDowntime || !prevDowntime.get('auto'))
      {
        return;
      }

      var aor = this.getDefaultAor();
      var subdivision = subdivisions.get(this.get('subdivision'));

      if (!aor || !subdivision)
      {
        return;
      }

      var autoDowntimes = this.settings.getAutoDowntimes(this.prodLine.id);

      if (_.isEmpty(autoDowntimes))
      {
        autoDowntimes = subdivision.get('autoDowntimes');
      }

      if (_.isEmpty(autoDowntimes))
      {
        return;
      }

      var nextAutoDowntime;

      for (var i = 0; i < autoDowntimes.length; ++i)
      {
        var autoDowntime = autoDowntimes[i];

        if (autoDowntime.reason !== prevDowntime.get('reason'))
        {
          continue;
        }

        for (var j = i + 1; j < autoDowntimes.length; ++j)
        {
          var next = autoDowntimes[j];

          if (next.when !== 'time')
          {
            nextAutoDowntime = next;

            break;
          }
        }

        if (nextAutoDowntime)
        {
          break;
        }
      }

      if (nextAutoDowntime)
      {
        this.startDowntime({
          aor: aor,
          reason: nextAutoDowntime.reason,
          reasonComment: '',
          auto: {}
        });
      }
    },

    /**
     * @private
     * @param {number} time
     * @returns {boolean}
     */
    isBetweenInitialDowntimeWindow: function(time)
    {
      var initialDowntimeWindow = parseInt(this.settings.getValue('initialDowntimeWindow'), 10);

      if (isNaN(initialDowntimeWindow) || initialDowntimeWindow < 1)
      {
        return false;
      }

      var windowStart = this.get('date').getTime();
      var windowEnd = windowStart + initialDowntimeWindow * 60 * 1000;

      return time >= windowStart && time <= windowEnd;
    },

    shouldStartTimedAutoDowntime: function(reason)
    {
      return this.get('state') === 'working' && !this.prodDowntimes.some(function(prodDowntime)
      {
        return prodDowntime.get('reason') === reason
          && (Date.now() - Date.parse(prodDowntime.get('finishedAt'))) < 10 * 60 * 1000;
      });
    },

    startTimedAutoDowntime: function(reason, duration)
    {
      if (!this.shouldStartTimedAutoDowntime(reason))
      {
        return;
      }

      var aor = this.getDefaultAor();

      if (!aor)
      {
        return;
      }

      viewport.closeAllDialogs();

      this.startDowntime({
        aor: aor,
        reason: reason,
        reasonComment: '',
        auto: {
          d: duration
        }
      });
    }

  }, {

    STATE: {
      IDLE: 'idle',
      WORKING: 'working',
      DOWNTIME: 'downtime'
    },

    LINE_STORAGE_KEY: LINE_STORAGE_KEY,

    parse: function(data)
    {
      if (typeof data.date === 'string')
      {
        data.date = new Date(data.date);
      }

      if (typeof data.createdAt === 'string')
      {
        data.createdAt = new Date(data.createdAt);
      }

      return data;
    }

  });
});

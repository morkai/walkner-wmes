// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/data/prodLog',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/core/Model',
  'app/core/util/getShiftStartInfo',
  'app/core/util/getShiftEndDate',
  'app/core/templates/userInfo',
  'app/orders/util/resolveProductName'
], function(
  _,
  t,
  user,
  time,
  prodLog,
  orgUnits,
  downtimeReasons,
  Model,
  getShiftStartInfo,
  getShiftEndDate,
  renderUserInfo,
  resolveProductName
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodShiftOrders',

    clientUrlRoot: '#prodShiftOrders',

    topicPrefix: 'prodShiftOrders',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'prodShiftOrders',

    initialize: function(attrs, options)
    {
      Model.prototype.initialize.apply(this, arguments);

      this.settings = options ? options.settings : null;
    },

    getLabel: function(includeProdLine)
    {
      var label = includeProdLine === false ? '' : (this.get('prodLine') + ': ');

      return label + this.get('orderId') + ', ' + this.get('operationNo');
    },

    serialize: function(options)
    {
      var obj = this.toJSON();

      var startedAt = Date.parse(obj.startedAt);
      var finishedAt = Date.parse(obj.finishedAt);

      if (!obj.date)
      {
        var shiftInfo = getShiftStartInfo(obj.startedAt);

        obj.date = shiftInfo.moment.format('L');
        obj.shift = shiftInfo.no;
      }
      else
      {
        obj.date = time.format(obj.date, 'L');
      }

      if (options.details && !finishedAt)
      {
        finishedAt = Date.now();
      }

      obj.shift = t('core', 'SHIFT:' + obj.shift);
      obj.startedAt = time.format(obj.startedAt, 'LTS');
      obj.finishedAt = time.format(obj.finishedAt, 'LTS');
      obj.duration = time.toString((finishedAt - startedAt) / 1000, !options.details);
      obj.creator = renderUserInfo(obj.creator);

      if (options.orgUnits)
      {
        var subdivision = orgUnits.getByTypeAndId('subdivision', obj.subdivision);
        var prodFlow = orgUnits.getByTypeAndId('prodFlow', obj.prodFlow);

        obj.subdivision = subdivision ? subdivision.getLabel() : '?';
        obj.prodFlow = prodFlow ? prodFlow.getLabel() : '?';
        obj.mrpControllers = Array.isArray(obj.mrpControllers) && obj.mrpControllers.length
          ? obj.mrpControllers.join(' ')
          : '';
      }

      obj.prodShift = obj.prodShift
        ? ('<a href="#prodShifts/' + obj.prodShift + '">' + obj.date + ', ' + obj.shift + '</a>')
        : (obj.date + ', ' + obj.shift);

      if (obj.orderData)
      {
        var operation = (obj.orderData.operations || {})[obj.operationNo] || {};

        obj.productName = resolveProductName(obj.orderData);
        obj.operationName = operation.name || '';
        obj.order = obj.orderId;
        obj.operation = obj.operationNo;

        if (obj.productName)
        {
          obj.order += ': ' + obj.productName;
        }

        if (obj.operationName)
        {
          obj.operation += ': ' + obj.operationName;
        }

        obj.product = obj.productName;

        if (obj.orderData.nc12 && obj.orderData.nc12 !== obj.orderId)
        {
          obj.product = obj.orderData.nc12 + ': ' + obj.product;
        }
      }
      else
      {
        obj.productName = '';
        obj.operationName = '';
        obj.order = obj.orderId;
        obj.operation = obj.operationNo;
      }

      if (options.orderUrl && user.isAllowedTo('ORDERS:VIEW'))
      {
        obj.orderUrl = '#' + (obj.mechOrder ? 'mechOrders' : 'orders') + '/' + encodeURIComponent(obj.orderId);
      }

      obj.taktTimeOk = this.isTaktTimeOk();
      obj.taktTimeSap = this.getTaktTime();
      obj.taktTime = this.getActualTaktTime();
      obj.taktTimeEff = this.getTaktTimeEfficiency();
      obj.workerCount = obj.workerCount.toLocaleString();
      obj.workerCountSap = this.getWorkerCountSap();
      obj.eff = 0;
      obj.efficiency = '';

      var eff = this.getEfficiency(options);

      if (eff)
      {
        obj.eff = eff;
        obj.efficiency = Math.round(eff * 100) + '%';
      }
      else if (obj.taktTimeEff)
      {
        obj.eff = obj.taktTimeEff / 100;
        obj.efficiency = obj.taktTimeEff + '%';
      }

      return obj;
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      if (row.eff && this.get('sapTaktTime'))
      {
        if (row.eff >= 1)
        {
          row.className = 'success';
        }
        else if (row.eff < 0.9)
        {
          row.className = 'danger';
        }
        else
        {
          row.className = 'warning';
        }
      }

      var orgUnitMrp = this.get('mrpControllers') || [];
      var orderData = this.get('orderData');
      var orderMrp = orderData && orderData.mrp;

      if (orderMrp && orgUnitMrp.indexOf(orderMrp) === -1)
      {
        row.mrpControllersText = '+' + orderMrp + '\n-' + row.mrpControllers;
        row.mrpControllers = orderMrp
          + ' <span style="text-decoration: line-through">' + row.mrpControllers + '</span>';
      }
      else
      {
        row.mrpControllersText = row.mrpControllers;
      }

      return row;
    },

    serializeDetails: function(options)
    {
      return this.serialize(Object.assign({
        orgUnits: true,
        orderUrl: true,
        details: true
      }, options));
    },

    onShiftChanged: function()
    {
      this.clear();
    },

    onOrderChanged: function(prodShift, orderData, operationNo, workerCount)
    {
      this.prepareOperations(orderData);

      var shiftDate = prodShift.get('date');
      var startedAt = time.getMoment().toDate();

      if (startedAt < shiftDate)
      {
        startedAt = new Date(shiftDate.getTime());
      }

      this.set({
        prodShift: prodShift.id,
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        date: shiftDate,
        shift: prodShift.get('shift'),
        mechOrder: orderData.no === null,
        subdivisionType: prodShift.getSubdivisionType(),
        orderId: orderData.no || orderData.nc12,
        operationNo: operationNo,
        orderData: orderData,
        workerCount: workerCount,
        totalQuantity: 0,
        quantityDone: 0,
        quantityLost: 0,
        losses: null,
        creator: user.getInfo(),
        startedAt: startedAt,
        finishedAt: null,
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        operators: prodShift.get('operators'),
        spigot: null,
        sapTaktTime: null,
        lastTaktTime: null,
        avgTaktTime: null,
        totalQuantityDone: null
      });
      this.set('sapTaktTime', this.getSapTaktTime());

      this.generateId(prodShift);
    },

    onOrderCorrected: function(prodShift, orderData, operationNo)
    {
      var orderId = orderData.no || orderData.nc12;

      if (orderId === this.get('orderId') && operationNo === this.get('operationNo'))
      {
        return null;
      }

      this.prepareOperations(orderData);

      var spigot = this.get('spigot');

      if (spigot)
      {
        spigot.forceCheck = true;
      }

      var changes = {
        mechOrder: orderData.no === null,
        orderId: orderId,
        operationNo: operationNo,
        orderData: orderData,
        creator: user.getInfo()
      };

      this.set(changes);
      this.set('sapTaktTime', this.getSapTaktTime());

      changes.sapTaktTime = this.get('sapTaktTime');

      if (this.get('workerCount') > this.getMaxWorkerCount())
      {
        prodShift.changeWorkerCount(0);
      }

      if (this.get('quantityDone') > this.getMaxQuantityDone())
      {
        prodShift.changeQuantityDone(0);
      }

      return changes;
    },

    onOrderContinued: function(prodShift)
    {
      this.set({
        prodShift: prodShift.id,
        division: prodShift.get('division'),
        subdivision: prodShift.get('subdivision'),
        mrpControllers: prodShift.get('mrpControllers'),
        prodFlow: prodShift.get('prodFlow'),
        workCenter: prodShift.get('workCenter'),
        prodLine: prodShift.prodLine.id,
        date: prodShift.get('date'),
        shift: prodShift.get('shift'),
        subdivisionType: prodShift.getSubdivisionType(),
        workerCount: 0,
        totalQuantity: 0,
        quantityDone: 0,
        quantityLost: 0,
        losses: null,
        creator: user.getInfo(),
        startedAt: time.getMoment().toDate(),
        finishedAt: null,
        master: prodShift.get('master'),
        leader: prodShift.get('leader'),
        operator: prodShift.get('operator'),
        operators: prodShift.get('operators'),
        spigot: null,
        sapTaktTime: null,
        lastTaktTime: null,
        avgTaktTime: null,
        totalQuantityDone: null
      });
      this.set('sapTaktTime', this.getSapTaktTime());

      this.generateId(prodShift);
    },

    generateId: function(prodShift)
    {
      this.set('_id', prodLog.generateId(this.get('startedAt'), prodShift.id + this.get('orderId')));
    },

    onWorkEnded: function()
    {
      this.clear();
    },

    isMechOrder: function()
    {
      return this.get('mechOrder');
    },

    getOrderNo: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return orderData.no || '?';
    },

    getNc12: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return orderData.nc12 || '?';
    },

    getProductName: function()
    {
      var orderData = this.get('orderData');

      if (!orderData)
      {
        return '-';
      }

      return resolveProductName(orderData) || '?';
    },

    getOperation: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return null;
      }

      if (!orderData.operations || !orderData.operations[operationNo])
      {
        return null;
      }

      return orderData.operations[operationNo];
    },

    getOperationName: function()
    {
      var operation = this.getOperation();
      var operationNo = this.get('operationNo');

      return (operation ? operation.name : '') || operationNo || '-';
    },

    getDurationString: function(currentTime, compact)
    {
      var startTime = Date.parse(this.get('startedAt'));
      var endTime = Date.parse(this.get('finishedAt')) || currentTime || Date.now();

      return time.toString(Math.round((endTime - startTime) / 1000), compact);
    },

    getEfficiencyClassName: function(options)
    {
      var eff = this.getEfficiency(options);

      if (eff >= 1)
      {
        return 'is-eff-high';
      }

      if (eff >= 0.9)
      {
        return 'is-eff-mid';
      }

      return 'is-eff-low';
    },

    getEfficiency: function(options)
    {
      return this.constructor.getEfficiency(this.attributes, options);
    },

    getTaktTimeEfficiency: function()
    {
      var sapTaktTime = parseFloat(this.get('sapTaktTime') || this.getSapTaktTime()) || 0;
      var actualTaktTime = parseFloat(this.getActualTaktTime()) || 0;

      return sapTaktTime && actualTaktTime ? Math.round(sapTaktTime / actualTaktTime * 100) : 0;
    },

    isTaktTimeOk: function()
    {
      var actualTaktTime = Math.round(this.get('avgTaktTime') / 1000) || 0;
      var sapTaktTime = this.get('sapTaktTime') || 0;

      return actualTaktTime <= sapTaktTime;
    },

    getSapTaktTime: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return 0;
      }

      var operation = orderData.operations ? orderData.operations[operationNo] : null;

      if (!operation)
      {
        return 0;
      }

      var workerCount = this.get('workerCount');

      if (!workerCount)
      {
        workerCount = this.getWorkerCountSap();
      }

      if (typeof workerCount !== 'number' || workerCount === 0 || operation.laborTime <= 0)
      {
        return 0;
      }

      var coeff = this.constructor.getTaktTimeCoeff(this.attributes);

      return Math.max(Math.round((operation.laborTime * coeff) / workerCount * 3600 / 100), 1);
    },

    getIptTaktTime: function()
    {
      return Math.round((this.get('iptTaktTime') || 0) / 1000);
    },

    getLastTaktTime: function()
    {
      return Math.round((this.get('lastTaktTime') || 0) / 1000);
    },

    getAvgTaktTime: function()
    {
      return Math.round((this.get('avgTaktTime') || 0) / 1000);
    },

    getTaktTime: function()
    {
      if (!this.get('orderData') || !this.get('operationNo'))
      {
        return '-';
      }

      return this.getSapTaktTime() || '?';
    },

    getActualTaktTime: function()
    {
      var avgTaktTime = this.getAvgTaktTime();

      if (avgTaktTime)
      {
        return avgTaktTime;
      }

      var finishedAt = time.getMoment(this.get('finishedAt'));

      if (!finishedAt.isValid())
      {
        return '-';
      }

      var duration = finishedAt.diff(this.get('startedAt'), 'seconds');
      var quantityDone = this.get('quantityDone');

      return quantityDone ? Math.max(1, Math.round(duration / quantityDone)) : '?';
    },

    getWorkerCountSap: function()
    {
      var orderData = this.get('orderData');
      var operationNo = this.get('operationNo');

      if (!orderData || !operationNo)
      {
        return '-';
      }

      var operation = orderData.operations ? orderData.operations[operationNo] : null;

      if (!operation || operation.laborTime <= 0 || operation.machineTime <= 0)
      {
        return '?';
      }

      return Math.max(Math.round(operation.laborTime / operation.machineTime), 1);
    },

    getWorkerCount: function()
    {
      return this.get('workerCount') || 0;
    },

    getWorkerCountForEdit: function()
    {
      var workerCount = this.getWorkerCount();

      if (workerCount !== 0)
      {
        return workerCount;
      }

      workerCount = this.getWorkerCountSap();

      if (typeof workerCount === 'string' || workerCount === 0)
      {
        return 0;
      }

      return workerCount;
    },

    getMaxWorkerCount: function()
    {
      var workerCountSap = this.getWorkerCountSap();

      if (workerCountSap > 0)
      {
        return Math.ceil(workerCountSap * 1.25);
      }

      return 15;
    },

    getMaxQuantityDone: function()
    {
      var orderData = this.get('orderData');

      if (orderData && orderData.qty)
      {
        return Math.ceil(orderData.qty * 1.25);
      }

      return 9999;
    },

    getStartedAt: function()
    {
      var startedAt = this.get('startedAt');

      if (!startedAt)
      {
        return '?';
      }

      return time.format(startedAt, 'LTS');
    },

    getQuantityDone: function()
    {
      return this.get('quantityDone') || 0;
    },

    getSubdivisionType: function()
    {
      var subdivision = orgUnits.getByTypeAndId('subdivision', this.get('subdivision'));

      return subdivision ? subdivision.get('type') : null;
    },

    getSpigotComponent: function(spigotPatterns, spigotNotPatterns)
    {
      var orderData = this.get('orderData');

      if (_.isEmpty(spigotPatterns) || !orderData || !Array.isArray(orderData.bom))
      {
        return null;
      }

      spigotPatterns = spigotPatterns
        .split('\n')
        .map(function(pattern) { return new RegExp(pattern, 'i'); });

      if (_.isEmpty(spigotNotPatterns))
      {
        spigotNotPatterns = [];
      }
      else
      {
        spigotNotPatterns = spigotNotPatterns
          .split('\n')
          .map(function(pattern) { return new RegExp(pattern, 'i'); });
      }

      var components = orderData.bom;

      for (var componentI = 0; componentI < components.length; ++componentI)
      {
        var component = components[componentI];

        if (this.isValidSpigotComponent(component, spigotPatterns, spigotNotPatterns))
        {
          if (_.isEmpty(component.nc12))
          {
            var matches = component.name.match(/([0-9]{12})/);

            if (!matches)
            {
              continue;
            }

            component = _.assign({}, component, {nc12: matches[1]});
          }

          return component;
        }
      }

      return null;
    },

    /**
     * @private
     * @param {Object} component
     * @param {Array.<RegExp>} patterns
     * @param {Array.<RegExp>} notPatterns
     * @returns {boolean}
     */
    isValidSpigotComponent: function(component, patterns, notPatterns)
    {
      for (var notPatternI = 0; notPatternI < notPatterns.length; ++notPatternI)
      {
        if (notPatterns[notPatternI].test(component.name))
        {
          return false;
        }
      }

      for (var patternI = 0; patternI < patterns.length; ++patternI)
      {
        if (patterns[patternI].test(component.name))
        {
          return true;
        }
      }

      return false;
    },

    getSpigotInsertComponent: function(insertGroups)
    {
      if (!insertGroups)
      {
        return null;
      }

      var groups = {};

      (insertGroups || '').split('\n').forEach(function(line)
      {
        var parts = line.split(':');
        var insertNc12 = parts[0].trim();
        var productNc12s = parts[1].split(', ');

        productNc12s.forEach(function(productNc12)
        {
          groups[productNc12.trim()] = insertNc12;
        });
      });

      var productNc12 = this.getNc12();
      var insertNc12 = groups[productNc12];

      if (!insertNc12)
      {
        return null;
      }

      return _.find(this.get('orderData').bom, function(component)
      {
        return component.nc12 === insertNc12;
      });
    },

    getOrderIdType: function()
    {
      return this.getSubdivisionType() === 'assembly' ? 'no' : 'nc12';
    },

    hasOrderData: function()
    {
      return !!this.get('orderId') && !!this.get('operationNo') && !!this.get('orderData');
    },

    isEditable: function()
    {
      return this.hasEnded() && !this.isFromPressWorksheet();
    },

    hasEnded: function()
    {
      return this.get('finishedAt') != null;
    },

    isFromPressWorksheet: function()
    {
      return this.get('pressWorksheet') != null;
    },

    finish: function()
    {
      if (!this.id || this.hasEnded())
      {
        return null;
      }

      var finishedAt = time.getMoment().toDate();
      var shiftEndDate = getShiftEndDate(this.get('date'), this.get('shift'));

      if (finishedAt > shiftEndDate)
      {
        finishedAt = shiftEndDate;
      }

      this.set('finishedAt', finishedAt);

      return {
        _id: this.id,
        finishedAt: finishedAt
      };
    },

    prepareOperations: function(orderData)
    {
      if (Array.isArray(orderData.operations))
      {
        var operations = {};

        orderData.operations.forEach(function(operation)
        {
          if (operation.workCenter !== '' && operation.laborTime !== -1)
          {
            operations[operation.no] = operation;
          }
        });

        orderData.operations = operations;
      }
      else if (!_.isObject(orderData.operations))
      {
        orderData.operations = {};
      }

      return orderData;
    }

  }, {

    parse: function(data)
    {
      ['date', 'startedAt', 'finishedAt', 'createdAt'].forEach(function(dateProperty)
      {
        if (typeof data[dateProperty] === 'string')
        {
          data[dateProperty] = new Date(data[dateProperty]);
        }
      });

      return data;
    },

    getEfficiency: function(pso, options)
    {
      var workDuration = pso.workDuration || (options && options.workDuration) || 0;

      if (!workDuration && options && options.prodDowntimes)
      {
        var now = Date.now();
        var startedAt = Date.parse(pso.startedAt);
        var finishedAt = pso.finishedAt ? Date.parse(pso.finishedAt) : now;

        workDuration = finishedAt - startedAt;

        options.prodDowntimes.forEach(function(dt)
        {
          var dtPso = dt.get('prodShiftOrder');
          var dtPsoId = dtPso && dtPso._id || dtPso;

          if (pso._id && pso._id !== dtPsoId)
          {
            return;
          }

          var reason = downtimeReasons.get(dt.get('reason'));

          if (reason && reason.get('type') !== 'break')
          {
            return;
          }

          var startedAt = Date.parse(dt.get('startedAt'));
          var finishedAt = dt.get('finishedAt') ? Date.parse(dt.get('finishedAt')) : now;

          workDuration -= finishedAt - startedAt;
        });

        workDuration /= 3600000;
      }

      if (workDuration <= 0)
      {
        return 0;
      }

      var taktTimeCoeff = this.getTaktTimeCoeff(pso);
      var num = pso.laborTime * taktTimeCoeff / 100 * pso.quantityDone;
      var den = workDuration * pso.workerCount;
      var efficiency = num / den;

      return isNaN(efficiency) || !isFinite(efficiency) ? 0 : efficiency;
    },

    getOperation: function(pso)
    {
      return pso.orderData && pso.orderData.operations && pso.orderData.operations[pso.operationNo] || null;
    },

    // Check backend/node_modules/prodShiftOrders/models/prodShiftOrder.js#getTaktTimeCoeff
    getTaktTimeCoeff: function(pso)
    {
      return this.getWcTaktTimeCoeff(
        pso.orderData && pso.orderData.taktTimeCoeff,
        this.getOperation(pso)
      );
    },

    getWcTaktTimeCoeff: function(wcToCoeff, operation)
    {
      if (!wcToCoeff || !operation)
      {
        return 1;
      }

      return wcToCoeff[operation.workCenter + '/' + operation.no]
        || wcToCoeff['*' + '/' + operation.no]
        || wcToCoeff[operation.workCenter]
        || wcToCoeff['*']
        || 1;
    }

  });
});

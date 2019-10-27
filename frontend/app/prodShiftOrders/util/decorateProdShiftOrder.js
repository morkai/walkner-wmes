// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/prodLines',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/util/getShiftStartInfo',
  'app/core/templates/userInfo',
  'app/orders/util/resolveProductName'
], function(
  time,
  t,
  user,
  subdivisions,
  mrpControllers,
  prodFlows,
  prodLines,
  renderOrgUnitPath,
  getShiftStartInfo,
  renderUserInfo,
  resolveProductName
) {
  'use strict';

  return function(prodShiftOrder, options)
  {
    var obj = prodShiftOrder.toJSON();

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

    obj.shift = t('core', 'SHIFT:' + obj.shift);
    obj.startedAt = time.format(obj.startedAt, 'LTS');
    obj.finishedAt = time.format(obj.finishedAt, 'LTS');
    obj.duration = finishedAt ? time.toString((finishedAt - startedAt) / 1000, !options.details) : '';
    obj.creator = renderUserInfo({userInfo: obj.creator});

    if (options.orgUnits)
    {
      var subdivision = subdivisions.get(obj.subdivision);
      var prodFlow = prodFlows.get(obj.prodFlow);

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

    obj.taktTimeOk = prodShiftOrder.isTaktTimeOk();
    obj.taktTimeSap = prodShiftOrder.getTaktTime();
    obj.taktTime = prodShiftOrder.getActualTaktTime();
    obj.taktTimeEff = prodShiftOrder.getTaktTimeEfficiency();
    obj.workerCountSap = prodShiftOrder.getWorkerCountSap();
    obj.efficiency = '';

    var eff = prodShiftOrder.getEfficiency();

    if (eff)
    {
      obj.efficiency = Math.round(eff * 100) + '%';
    }
    else if (obj.taktTimeEff)
    {
      obj.efficiency = obj.taktTimeEff + '%';
    }

    return obj;
  };
});

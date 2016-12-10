// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath',
  'app/core/util/getShiftStartInfo',
  'app/core/templates/userInfo'
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
  renderUserInfo
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

      obj.date = shiftInfo.moment.format('YYYY-MM-DD');
      obj.shift = shiftInfo.shift;
    }
    else
    {
      obj.date = time.format(obj.date, 'YYYY-MM-DD');
    }

    obj.shift = t('core', 'SHIFT:' + obj.shift);
    obj.startedAt = time.format(obj.startedAt, 'HH:mm:ss');
    obj.finishedAt = time.format(obj.finishedAt, 'HH:mm:ss');
    obj.duration = finishedAt ? time.toString((finishedAt - startedAt) / 1000) : '-';
    obj.creator = renderUserInfo({userInfo: obj.creator});

    if (options.orgUnits)
    {
      var subdivision = subdivisions.get(obj.subdivision);
      var prodFlow = prodFlows.get(obj.prodFlow);

      obj.subdivision = subdivision ? subdivision.getLabel() : '?';
      obj.prodFlow = prodFlow ? prodFlow.getLabel() : '?';
      obj.mrpControllers = Array.isArray(obj.mrpControllers) && obj.mrpControllers.length
        ? obj.mrpControllers.join('; ')
        : '?';
    }

    obj.prodShift = obj.prodShift
      ? ('<a href="#prodShifts/' + obj.prodShift + '">' + obj.date + ', ' + obj.shift + '</a>')
      : (obj.date + ', ' + obj.shift);

    if (obj.orderData)
    {
      var operation = (obj.orderData.operations || {})[obj.operationNo] || {};

      obj.order = obj.orderId + ': <em>' + (obj.orderData.description || obj.orderData.name || '?') + '</em>';
      obj.operation = obj.operationNo + ': <em>' + (operation.name || '?') + '</em>';
    }
    else
    {
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
    obj.workerCountSap = prodShiftOrder.getWorkerCountSap();
    obj.efficiency = Math.round(prodShiftOrder.getEfficiency() * 100) + '%';

    return obj;
  };
});

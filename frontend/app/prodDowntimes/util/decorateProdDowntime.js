// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/prodLines',
  'app/data/downtimeReasons',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/templates/userInfo',
  'app/orders/util/resolveProductName',
  './decorateProdDowntimeChange'
], function(
  _,
  time,
  t,
  user,
  aors,
  subdivisions,
  mrpControllers,
  prodFlows,
  prodLines,
  downtimeReasons,
  renderOrgUnitPath,
  renderUserInfo,
  resolveProductName,
  decorateProdDowntimeChange
) {
  'use strict';

  return function decorateProdDowntime(prodDowntime, options)
  {
    var canViewProdData = user.isAllowedTo('PROD_DATA:VIEW');
    var longDateFormat = options && options.longDate ? 'LLLL' : 'L, LTS';
    var obj = prodDowntime.toJSON();

    obj.statusClassName = prodDowntime.getCssClassName();
    obj.statusText = t('prodDowntimes', 'PROPERTY:status:' + obj.status);

    obj.className = obj.statusClassName;

    if (obj.reasonComment && obj.reasonComment.trim().length)
    {
      obj.className += ' is-withReasonComment';
    }

    var aor = aors.get(obj.aor);

    obj.aor = aor ? aor.getLabel() : obj.aor;

    var prodLine = prodLines.get(obj.prodLine);

    if (prodLine)
    {
      obj.prodLine = prodLine.getLabel();
      obj.prodLinePath = renderOrgUnitPath(prodLine, false, false);
    }

    var reason = downtimeReasons.get(obj.reason);

    obj.reason = reason ? reason.getLabel() : obj.reason;

    obj.duration = prodDowntime.getDurationString(options && options.currentTime);

    obj.startedAt = time.format(obj.startedAt, longDateFormat);

    obj.finishedAt = obj.finishedAt
      ? time.format(obj.finishedAt, longDateFormat)
      : t('prodDowntimes', 'NO_DATA:finishedAt');

    obj.corroboratedAt = time.format(obj.corroboratedAt, longDateFormat) || '';

    obj.order = obj.prodShiftOrder
      ? (obj.orderId + '; ' + obj.operationNo)
      : t('prodDowntimes', 'NO_DATA:order');

    if (canViewProdData && obj.prodShiftOrder)
    {
      obj.order = '<a href="#prodShiftOrders/' + (obj.prodShiftOrder._id || obj.prodShiftOrder) + '">'
        + obj.order + '</a>';
    }

    var subdivision = subdivisions.get(obj.subdivision);
    var prodFlow = prodFlows.get(obj.prodFlow);

    obj.subdivision = subdivision ? subdivision.getLabel() : '';
    obj.prodFlow = prodFlow ? prodFlow.getLabel() : '';
    obj.mrpControllers
      = Array.isArray(obj.mrpControllers) && obj.mrpControllers.length
        ? obj.mrpControllers.join('; ')
        : '';

    var pso = obj.prodShiftOrder;

    if (obj.orderData)
    {
      obj.productName = obj.orderData.name;
      obj.productFamily = obj.orderData.family;
      obj.orderMrp = '<span title="' + obj.mrpControllers + '">' + (obj.orderData.mrp || '') + '</span>';
    }
    else
    {
      obj.orderMrp = '<em>' + obj.mrpControllers + '</em>';
    }

    if (pso && pso.orderData)
    {
      var orderData = pso.orderData;

      if (!obj.orderData)
      {
        obj.productName = resolveProductName(orderData);
        obj.productFamily = obj.productName.substring(0, 6);
      }

      if (orderData.operations && orderData.operations[obj.operationNo])
      {
        obj.operationName = orderData.operations[obj.operationNo].name;
      }
    }

    obj.date = obj.date ? time.format(obj.date, 'L') : '?';
    obj.shift = obj.shift ? t('core', 'SHIFT:' + obj.shift) : '?';
    obj.prodShiftText = obj.date + ', ' + obj.shift;

    if (canViewProdData && obj.prodShift)
    {
      obj.prodShiftText = '<a href="#prodShifts/' + obj.prodShift + '">' + obj.prodShiftText + '</a>';
    }

    obj.masterInfo = renderUserInfo({userInfo: obj.master});
    obj.leaderInfo = renderUserInfo({userInfo: obj.leader});

    if (Array.isArray(obj.operators) && obj.operators.length)
    {
      obj.operatorInfo = obj.operators
        .map(function(operator) { return renderUserInfo({userInfo: operator}); })
        .join('; ');
    }
    else
    {
      obj.operatorInfo = renderUserInfo({userInfo: obj.operator});
    }

    obj.creatorInfo = renderUserInfo({userInfo: obj.creator});
    obj.corroboratorInfo = renderUserInfo({userInfo: obj.corroborator});

    obj.history = Array.isArray(obj.changes) && (!options || options.noHistory !== true)
      ? obj.changes.map(decorateProdDowntimeChange)
      : [];

    var changesCount = obj.changesCount;

    if (changesCount && options && options.changesCount)
    {
      if (changesCount.reason)
      {
        obj.reason += ' <span title="' + t('prodDowntimes', 'changesCount:reason') + '" class="label label-'
          + (changesCount.reason >= options.maxReasonChanges ? 'danger' : 'warning')
          + '">' + changesCount.reason + '</span>';
      }

      if (changesCount.aor)
      {
        obj.aor += ' <span title="' + t('prodDowntimes', 'changesCount:aor') + '" class="label label-'
          + (changesCount.aor >= options.maxAorChanges ? 'danger' : 'warning')
          + '">' + changesCount.aor + '</span>';
      }
    }

    obj.prodFlowText = obj.prodFlow;

    if (options && options.productFamily && obj.productFamily)
    {
      obj.prodFlow = '<span class="label label-default" title="' + _.escape(obj.productName) + '">'
        + _.escape(obj.productFamily) + '</span> ' + obj.prodFlow;
    }

    return obj;
  };
});

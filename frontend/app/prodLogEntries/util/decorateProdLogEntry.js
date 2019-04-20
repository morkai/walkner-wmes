// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/aors',
  'app/data/prodLines',
  'app/data/downtimeReasons',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  aors,
  prodLines,
  downtimeReasons,
  renderOrgUnitPath,
  renderUserInfo
) {
  'use strict';

  var EDIT_TYPE_TO_NLS_DOMAIN = {
    editShift: 'prodShifts',
    editOrder: 'prodShiftOrders',
    editDowntime: 'prodDowntimes'
  };

  function prepareChangedProperties(type, changes)
  {
    var properties = _.without(Object.keys(changes), '_id');

    if (type === 'editOrder')
    {
      properties = _.without(properties, 'mechOrder', 'orderData');

      if (properties.indexOf('orderId') !== -1)
      {
        properties = _.without(properties, 'operationNo');
      }
    }

    return properties
      .map(function(property) { return t(EDIT_TYPE_TO_NLS_DOMAIN[type], 'PROPERTY:' + property); })
      .join(', ');
  }

  return function(prodLogEntryModel)
  {
    var prodLogEntry = prodLogEntryModel.toJSON();
    var logData = prodLogEntry.data;
    var dataKey = 'data:' + prodLogEntry.type;
    var data = {};

    switch (prodLogEntry.type)
    {
      case 'changeShift':
        data.date = time.format(logData.startedProdShift.date, 'L');
        data.shift = t('core', 'SHIFT:' + logData.startedProdShift.shift);
        break;

      case 'addShift':
        data.date = time.format(logData.date, 'L');
        data.shift = t('core', 'SHIFT:' + logData.shift);
        break;

      case 'changeMaster':
      case 'changeLeader':
      case 'changeOperator':
        data.name = logData ? logData.label : '-';
        break;

      case 'changeOperators':
      {
        data.names = (logData && logData.personnel.length ? logData.personnel : [])
          .filter(function(op) { return !!op.label; })
          .map(function(op) { return '<em>' + op.label + '</em>'; })
          .join(', ');

        break;
      }

      case 'changeQuantitiesDone':
        data.hour = logData.hour + 1;
        data.value = logData.newValue;
        break;

      case 'changeOrder':
      case 'correctOrder':
      case 'addOrder':
        var operation = logData.orderData && logData.orderData.operations
            ? logData.orderData.operations[logData.operationNo]
            : null;

        data.orderId = logData.orderId;
        data.orderName = logData.orderData.name || '?';
        data.operationNo = logData.operationNo;
        data.operationName = operation ? operation.name : '?';
        break;

      case 'changeQuantityDone':
      case 'changeWorkerCount':
        data.value = logData.newValue;
        break;

      case 'startDowntime':
      case 'addDowntime':
        var reason = downtimeReasons.get(logData.reason);
        var aor = aors.get(logData.aor);

        data._id = logData._id;
        data.reason = reason ? reason.getLabel() : logData.reason;
        data.aor = aor ? aor.getLabel() : logData.aor;
        break;

      case 'editShift':
      case 'editOrder':
      case 'editDowntime':
        if (prodLogEntry.type === 'editDowntime')
        {
          data._id = logData._id;
        }

        data.changedProperties = prepareChangedProperties(prodLogEntry.type, logData);
        break;

      case 'checkSpigot':
        dataKey += ':' + (logData.final ? 'final' : 'initial');
        data.result = logData.valid ? 'valid' : 'invalid';
        data.nc12 = logData.nc12;
        data.downtimeId = logData.prodDowntime;
        break;

      case 'checkSerialNumber':
        dataKey += logData.error ? ':error' : '';
        data.sn = logData._id;
        data.error = logData.error;
        break;

      case 'setNextOrder':
        if (_.isEmpty(logData.orderNo) && _.isEmpty(logData.orders))
        {
          data.queue = '-';
        }
        else if (Array.isArray(logData.orders))
        {
          data.queue = logData.orders.map(function(next) { return next.orderNo; }).join(', ');
        }
        else
        {
          data.queue = logData.orderNo;
        }
        break;

      default:
        data = logData;
        break;
    }

    var timeDiff = null;

    if (prodLogEntry.savedAt)
    {
      timeDiff = (Date.parse(prodLogEntry.savedAt) - Date.parse(prodLogEntry.createdAt)) / 1000;
    }

    prodLogEntry.data = t('prodLogEntries', dataKey, data);
    prodLogEntry.type = t('prodLogEntries', 'type:' + prodLogEntry.type);
    prodLogEntry.createdAt = time.format(prodLogEntry.createdAt, 'L, LTS');
    prodLogEntry.creator = renderUserInfo({userInfo: prodLogEntry.creator});

    if (timeDiff)
    {
      prodLogEntry.createdAt += ' ('
        + (timeDiff < 0 ? '-' : '+')
        + time.toString(Math.abs(timeDiff), false, true)
        + ')';
    }

    if (prodLogEntry.prodShift)
    {
      prodLogEntry.prodShift = '<a href="#prodShifts/' + prodLogEntry.prodShift._id + '">'
        + time.format(prodLogEntry.prodShift.date, 'L')
        + ', ' + t('core', 'SHIFT:' + prodLogEntry.prodShift.shift)
        + '</a>';
    }

    if (prodLogEntry.prodShiftOrder)
    {
      prodLogEntry.prodShiftOrder = '<a href="#prodShiftOrders/' + prodLogEntry.prodShiftOrder._id + '">'
        + prodLogEntry.prodShiftOrder.orderId
        + ', ' + prodLogEntry.prodShiftOrder.operationNo
        + '</a>';
    }
    else
    {
      prodLogEntry.prodShiftOrder = t('prodLogEntries', 'noData:prodShiftOrder');
    }

    return prodLogEntry;
  };
});

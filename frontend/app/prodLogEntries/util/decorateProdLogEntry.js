// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/aors',
  'app/data/prodLines',
  'app/data/downtimeReasons',
  'app/data/views/renderOrgUnitPath',
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
    /*jshint -W015*/

    var prodLogEntry = prodLogEntryModel.toJSON();
    var dataKey = 'data:' + prodLogEntry.type;
    var data = {};

    switch (prodLogEntry.type)
    {
      case 'changeShift':
        data.date = time.format(prodLogEntry.data.startedProdShift.date, 'YYYY-MM-DD');
        data.shift = t('core', 'SHIFT:' + prodLogEntry.data.startedProdShift.shift);
        break;

      case 'addShift':
        data.date = time.format(prodLogEntry.data.date, 'YYYY-MM-DD');
        data.shift = t('core', 'SHIFT:' + prodLogEntry.data.shift);
        break;

      case 'changeMaster':
      case 'changeLeader':
      case 'changeOperator':
        data.name = prodLogEntry.data ? prodLogEntry.data.label : '-';
        break;

      case 'changeQuantitiesDone':
        data.hour = prodLogEntry.data.hour + 1;
        data.value = prodLogEntry.data.newValue;
        break;

      case 'changeOrder':
      case 'correctOrder':
      case 'addOrder':
        var operation = prodLogEntry.data.orderData && prodLogEntry.data.orderData.operations
            ? prodLogEntry.data.orderData.operations[prodLogEntry.data.operationNo]
            : null;

        data.orderId = prodLogEntry.data.orderId;
        data.orderName = prodLogEntry.data.orderData.name || '?';
        data.operationNo = prodLogEntry.data.operationNo;
        data.operationName = operation ? operation.name : '?';
        break;

      case 'changeQuantityDone':
      case 'changeWorkerCount':
        data.value = prodLogEntry.data.newValue;
        break;

      case 'startDowntime':
      case 'addDowntime':
        var reason = downtimeReasons.get(prodLogEntry.data.reason);
        var aor = aors.get(prodLogEntry.data.aor);

        data._id = prodLogEntry.data._id;
        data.reason = reason ? reason.getLabel() : prodLogEntry.data.reason;
        data.aor = aor ? aor.getLabel() : prodLogEntry.data.aor;
        break;

      case 'editShift':
      case 'editOrder':
      case 'editDowntime':
        if (prodLogEntry.type === 'editDowntime')
        {
          data._id = prodLogEntry.data._id;
        }

        data.changedProperties = prepareChangedProperties(prodLogEntry.type, prodLogEntry.data);
        break;

      case 'checkSpigot':
        dataKey += ':' + (prodLogEntry.data.final ? 'final' : 'initial');
        data.result = prodLogEntry.data.valid ? 'valid' : 'invalid';
        data.nc12 = prodLogEntry.data.nc12;
        data.downtimeId = prodLogEntry.data.prodDowntime;
        break;

      case 'checkSerialNumber':
        dataKey += prodLogEntry.data.error ? ':error' : '';
        data.sn = prodLogEntry.data._id;
        data.error = prodLogEntry.data.error;
        break;

      default:
        data = prodLogEntry.data;
        break;
    }

    var timeDiff = null;

    if (prodLogEntry.savedAt)
    {
      timeDiff = (Date.parse(prodLogEntry.savedAt) - Date.parse(prodLogEntry.createdAt)) / 1000;
    }

    prodLogEntry.data = t('prodLogEntries', dataKey, data);
    prodLogEntry.type = t('prodLogEntries', 'type:' + prodLogEntry.type);
    prodLogEntry.createdAt = time.format(prodLogEntry.createdAt, 'YYYY-MM-DD HH:mm:ss');
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
        + time.format(prodLogEntry.prodShift.date, 'YYYY-MM-DD')
        + ', ' + t('core', 'SHIFT:' + prodLogEntry.prodShift.shift)
        + '</a>';
    }

    if (prodLogEntry.prodShiftOrder)
    {
      prodLogEntry.prodShiftOrder =
        '<a href="#prodShiftOrders/' + prodLogEntry.prodShiftOrder._id + '">'
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

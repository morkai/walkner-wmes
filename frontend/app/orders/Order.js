// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../i18n',
  '../core/Model',
  '../data/orderStatuses',
  './util/resolveProductName',
  './OperationCollection',
  './DocumentCollection',
  './ComponentCollection',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  time,
  t,
  Model,
  orderStatuses,
  resolveProductName,
  OperationCollection,
  DocumentCollection,
  ComponentCollection,
  renderOrderStatusLabel
) {
  'use strict';

  var DATE_PROPS = [
    'startDate',
    'finishDate',
    'scheduledStartDate',
    'scheduledFinishDate'
  ];
  var TIME_PROPS = [
    'sapCreatedAt',
    'createdAt',
    'updatedAt'
  ];

  return Model.extend({

    urlRoot: '/orders',

    clientUrlRoot: '#orders',

    topicPrefix: 'orders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'orders',

    labelAttribute: '_id',

    parse: function(data, xhr)
    {
      data = Model.prototype.parse.call(this, data, xhr);

      data.operations = new OperationCollection(data.operations);
      data.documents = new DocumentCollection(data.documents);
      data.bom = new ComponentCollection(data.bom);

      return data;
    },

    toJSON: function()
    {
      var obj = Model.prototype.toJSON.call(this);

      obj.operations = obj.operations ? obj.operations.toJSON() : [];

      if (!Array.isArray(obj.documents))
      {
        obj.documents = obj.documents && obj.documents.toJSON ? obj.documents.toJSON() : [];
      }

      if (!Array.isArray(obj.bom))
      {
        obj.bom = obj.bom && obj.bom.toJSON ? obj.bom.toJSON() : [];
      }

      return obj;
    },

    serialize: function(options)
    {
      var obj = this.toJSON();

      obj.productName = resolveProductName(obj);

      DATE_PROPS.forEach(function(prop)
      {
        if (obj[prop])
        {
          obj[prop + 'Text'] = time.format(obj[prop], 'LL');
        }
      });

      TIME_PROPS.forEach(function(prop)
      {
        if (obj[prop])
        {
          obj[prop + 'Text'] = time.format(obj[prop], 'LLL');
        }
      });

      if (!obj.unit)
      {
        obj.unit = 'PCE';
      }

      if (!obj.qtyMax)
      {
        obj.qtyMax = obj.qty;
      }

      if (obj.qty)
      {
        obj.qtyUnit = obj.qty + ' ' + obj.unit;
      }

      if (obj.qtyMax)
      {
        obj.qtyMaxUnit = obj.qtyMax + ' ' + obj.unit;
      }

      if (obj.qtyDone)
      {
        obj.qtyDoneUnit = (obj.qtyDone.total || 0) + ' ' + obj.unit;
      }

      obj.qtys = '';

      if (obj.qtyDone && obj.qtyDone.total >= 0)
      {
        obj.qtys += obj.qtyDone.total;
      }

      if (obj.qty)
      {
        if (obj.qtys.length)
        {
          obj.qtys += '/';
        }

        obj.qtys += obj.qty;
      }

      obj.statusLabels = orderStatuses.findAndFill(obj.statuses).map(renderOrderStatusLabel).join(' ');

      var delayReason = options && options.delayReasons && options.delayReasons.get(obj.delayReason);
      var m4 = obj.m4;

      obj.delayReason = delayReason ? delayReason.getLabel() : null;

      if (m4)
      {
        obj.m4 = t('orders', 'm4:' + m4);

        if (obj.delayReason)
        {
          var drm = delayReason.get('drm');

          if (drm)
          {
            obj.m4 += ' (' + drm + ')';
          }
        }
      }

      obj.psStatus = !obj.psStatus || obj.psStatus === 'unknown'
        ? null
        : t('orders', 'psStatus:' + obj.psStatus);

      return obj;
    }

  });
});

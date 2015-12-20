// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Model',
  './OperationCollection',
  './DocumentCollection',
  './ComponentCollection'
], function(
  time,
  Model,
  OperationCollection,
  DocumentCollection,
  ComponentCollection
) {
  'use strict';

  var DATE_PROPS = [
    'startDate',
    'finishDate',
    'scheduledStartDate',
    'scheduledFinishDate'
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
      var order = Model.prototype.toJSON.call(this);

      DATE_PROPS.forEach(function(prop)
      {
        if (order[prop])
        {
          order[prop + 'Text'] = time.format(order[prop], 'LL');
        }
      });

      if (order.scheduledFinishDate)
      {
        order.scheduledFinishDateText = time.format(order.scheduledFinishDate, 'LL');
      }

      if (order.qty && order.unit)
      {
        order.qtyUnit = order.qty + ' ' + order.unit;
      }

      if (order.createdAt)
      {
        order.createdAtText = time.format(order.createdAt, 'LLLL');
      }

      if (order.updatedAt)
      {
        order.updatedAtText = time.format(order.updatedAt, 'LLLL');
      }

      order.operations = order.operations ? order.operations.toJSON() : [];

      if (!Array.isArray(order.documents))
      {
        order.documents = order.documents && order.documents.toJSON ? order.documents.toJSON() : [];
      }

      if (!Array.isArray(order.bom))
      {
        order.bom = order.bom && order.bom.toJSON ? order.bom.toJSON() : [];
      }

      return order;
    }

  });
});

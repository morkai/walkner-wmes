// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOrderModel(app, mongoose)
{
  var operationSchema = mongoose.Schema({
    no: {
      type: String,
      trim: true
    },
    workCenter: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    qty: {
      type: Number
    },
    unit: {
      type: String,
      trim: true
    },
    machineSetupTime: {
      type: Number
    },
    laborSetupTime: {
      type: Number
    },
    machineTime: {
      type: Number
    },
    laborTime: {
      type: Number
    }
  }, {
    _id: false
  });

  var changeSchema = mongoose.Schema({
    time: Date,
    user: {},
    oldValues: {},
    newValues: {},
    comment: {
      type: String,
      default: ''
    }
  }, {
    _id: false
  });

  var orderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: Date,
    updatedAt: Date,
    nc12: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    mrp: {
      type: String,
      trim: true
    },
    qty: Number,
    unit: {
      type: String,
      trim: true
    },
    startDate: Date,
    finishDate: Date,
    tzOffsetMs: Number,
    statuses: [String],
    statusesSetAt: {},
    delayReason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DelayReason',
      default: null
    },
    operations: [operationSchema],
    changes: [changeSchema],
    importTs: Date
  }, {
    id: false
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.index({nc12: 1, finishDate: -1});
  orderSchema.index({finishDate: -1});
  orderSchema.index({startDate: -1, mrp: 1, statuses: 1});

  orderSchema.statics.prepareForInsert = function(order, createdAt)
  {
    order.createdAt = createdAt;
    order.tzOffsetMs = (order.startDate ? order.startDate.getTimezoneOffset() : 0) * 60 * 1000 * -1;
    order.changes = [];

    orderSchema.statics.resetStatusesSetAt(order);

    return order;
  };

  orderSchema.statics.prepareMissingForInsert = function(missingOrder, createdAt)
  {
    return {
      _id: missingOrder._id,
      createdAt: createdAt,
      updatedAt: null,
      nc12: null,
      name: null,
      mrp: null,
      qty: null,
      unit: null,
      startDate: null,
      finishDate: null,
      tzOffsetMs: 0,
      statuses: [],
      statusesSetAt: {},
      delayReason: null,
      operations: missingOrder.operations,
      changes: [],
      importTs: missingOrder.importTs
    };
  };

  orderSchema.statics.prepareForUpdate = function(orderModel, newOrderData, updatedAt, change, $set)
  {
    $set.updatedAt = updatedAt;
    $set.importTs = newOrderData.importTs;

    if ($set.startDate)
    {
      $set.tzOffsetMs = $set.startDate.getTimezoneOffset() * 60 * 1000 * -1;
    }

    if ($set.statuses)
    {
      $set.statusesSetAt = orderSchema.statics.prepareStatusesSetAt(
        orderModel.statusesSetAt,
        change.time,
        change.newValues.statuses
      );
    }

    return $set;
  };

  orderSchema.statics.resetStatusesSetAt = function(order)
  {
    var statusSetAt = order.importTs;
    var statusesSetAt = {};

    for (var i = 0; i < order.statuses.length; ++i)
    {
      statusesSetAt[order.statuses[i]] = statusSetAt;
    }

    order.statusesSetAt = statusesSetAt;
  };

  orderSchema.statics.prepareStatusesSetAt = function(oldStatusesSetAt, newStatusSetAt, newStatuses)
  {
    var newStatusesSetAt = {};

    for (var i = 0; i < newStatuses.length; ++i)
    {
      var status = newStatuses[i];
      var oldStatusSetAt = oldStatusesSetAt[status];

      newStatusesSetAt[status] = oldStatusSetAt || newStatusSetAt;
    }

    return newStatusesSetAt;
  };

  mongoose.model('Order', orderSchema);
};

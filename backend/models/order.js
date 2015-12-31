// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var documentSchema = mongoose.Schema({
    item: String,
    name: String,
    nc15: String
  }, {
    _id: false
  });

  var componentSchema = mongoose.Schema({
    nc12: String,
    item: String,
    qty: Number,
    unit: String,
    name: String,
    unloadingPoint: String
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
    _id: String,
    createdAt: Date,
    updatedAt: Date,
    nc12: String,
    name: String,
    mrp: String,
    qty: Number,
    unit: String,
    startDate: Date,
    finishDate: Date,
    tzOffsetMs: Number,
    scheduledStartDate: Date,
    scheduledFinishDate: Date,
    leadingOrder: String,
    salesOrder: String,
    salesOrderItem: String,
    priority: String,
    description: String,
    soldToParty: String,
    statuses: [String],
    statusesSetAt: {},
    delayReason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DelayReason',
      default: null
    },
    operations: [operationSchema],
    documents: [documentSchema],
    bom: [componentSchema],
    changes: [changeSchema],
    importTs: Date
  }, {
    id: false
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.index({startDate: -1});
  orderSchema.index({finishDate: -1});
  orderSchema.index({nc12: -1, finishDate: -1});
  orderSchema.index({mrp: 1, startDate: -1});
  orderSchema.index({salesOrder: 1, salesOrderItem: 1});

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
      scheduledStartDate: null,
      scheduledFinishDate: null,
      leadingOrder: null,
      salesOrder: null,
      salesOrderItem: null,
      priority: null,
      description: null,
      soldToParty: null,
      statuses: [],
      statusesSetAt: {},
      delayReason: null,
      operations: missingOrder.operations,
      documents: [],
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

  orderSchema.statics.copyOrderIntake = function(order, orderIntake)
  {
    order.description = orderIntake.description;
    order.soldToParty = orderIntake.soldToParty;
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

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setupOrderModel(app, mongoose)
{
  const operationSchema = new mongoose.Schema({
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
    qty: Number,
    unit: {
      type: String,
      trim: true
    },
    machineSetupTime: Number,
    laborSetupTime: Number,
    machineTime: Number,
    laborTime: Number,
    sapMachineSetupTime: Number,
    sapLaborSetupTime: Number,
    sapMachineTime: Number,
    sapLaborTime: Number
  }, {
    _id: false
  });

  const documentSchema = new mongoose.Schema({
    item: String,
    name: String,
    nc15: String
  }, {
    _id: false
  });

  const componentSchema = new mongoose.Schema({
    nc12: String,
    item: String,
    qty: Number,
    unit: String,
    name: String,
    unloadingPoint: String
  }, {
    _id: false
  });

  const changeSchema = new mongoose.Schema({
    time: Date,
    user: {},
    oldValues: {},
    newValues: {},
    comment: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      default: 'system',
      enum: ['system', 'other', 'ps', 'wh']
    }
  }, {
    _id: false
  });

  const orderSchema = new mongoose.Schema({
    _id: String,
    createdAt: Date,
    updatedAt: Date,
    nc12: String,
    name: String,
    mrp: String,
    qty: Number,
    qtyDone: {},
    qtyMax: {},
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
    sapCreatedAt: Date,
    statuses: [String],
    statusesSetAt: {},
    delayReason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DelayReason',
      default: null
    },
    whStatus: String,
    whTime: Date,
    whDropZone: String,
    operations: [operationSchema],
    documents: [documentSchema],
    bom: [componentSchema],
    changes: [changeSchema],
    importTs: Date
  }, {
    id: false
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.index({scheduledStartDate: -1});
  orderSchema.index({nc12: 1, scheduledStartDate: -1});
  orderSchema.index({mrp: 1, scheduledStartDate: -1});
  orderSchema.index({salesOrder: 1, salesOrderItem: 1});
  orderSchema.index({leadingOrder: 1});

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
      qtyDone: {},
      qtyMax: {},
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
      sapCreatedAt: null,
      statuses: [],
      statusesSetAt: {},
      delayReason: null,
      whStatus: 'unknown',
      whTime: null,
      whDropZone: '',
      operations: missingOrder.operations,
      documents: [],
      bom: [],
      changes: [],
      importTs: missingOrder.importTs
    };
  };

  orderSchema.statics.prepareForUpdate = function(orderModel, newOrderData, updatedAt, change, $set)
  {
    $set.updatedAt = updatedAt;
    $set.importTs = newOrderData.importTs;

    if ($set.scheduledStartDate)
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
    order.sapCreatedAt = orderIntake.sapCreatedAt;
  };

  orderSchema.statics.resetStatusesSetAt = function(order)
  {
    const statusSetAt = order.importTs;
    const statusesSetAt = {};

    for (let i = 0; i < order.statuses.length; ++i)
    {
      statusesSetAt[order.statuses[i]] = statusSetAt;
    }

    order.statusesSetAt = statusesSetAt;
  };

  orderSchema.statics.prepareStatusesSetAt = function(oldStatusesSetAt, newStatusSetAt, newStatuses)
  {
    const newStatusesSetAt = {};

    for (let i = 0; i < newStatuses.length; ++i)
    {
      const status = newStatuses[i];
      const oldStatusSetAt = oldStatusesSetAt[status];

      newStatusesSetAt[status] = oldStatusSetAt || newStatusSetAt;
    }

    return newStatusesSetAt;
  };

  orderSchema.statics.recountQtyDone = function(orderNo, done)
  {
    const qtyDone = {
      total: Number.MAX_SAFE_INTEGER,
      byLine: {},
      byOperation: {}
    };

    step(
      function()
      {
        const conditions = {
          orderId: orderNo
        };
        const fields = {
          quantityDone: 1,
          operationNo: 1,
          prodLine: 1
        };

        mongoose.model('ProdShiftOrder').find(conditions, fields).lean().exec(this.next());
      },
      function(err, psos)
      {
        if (err)
        {
          return this.skip(err);
        }

        psos.forEach(pso =>
        {
          if (!qtyDone.byLine[pso.prodLine])
          {
            qtyDone.byLine[pso.prodLine] = 0;
          }

          qtyDone.byLine[pso.prodLine] += pso.quantityDone;

          if (!qtyDone.byOperation[pso.operationNo])
          {
            qtyDone.byOperation[pso.operationNo] = 0;
          }

          qtyDone.byOperation[pso.operationNo] += pso.quantityDone;
        });

        Object.keys(qtyDone.byOperation).forEach(operationNo =>
        {
          const operationQtyDone = qtyDone.byOperation[operationNo];

          if (operationQtyDone > 0 && operationQtyDone < qtyDone.total)
          {
            qtyDone.total = operationQtyDone;
          }
        });

        if (qtyDone.total === Number.MAX_SAFE_INTEGER)
        {
          qtyDone.total = 0;
        }

        mongoose.model('Order').update({_id: orderNo}, {$set: {qtyDone: qtyDone}}, this.next());
      },
      function(err)
      {
        if (!err)
        {
          app.broker.publish(`orders.quantityDone.${orderNo}`, qtyDone);
        }

        done(err, qtyDone);
      }
    );
  };

  mongoose.model('Order', orderSchema);
};

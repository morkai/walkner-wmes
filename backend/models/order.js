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
    unloadingPoint: String,
    supplyArea: String
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
    enteredBy: String,
    changedBy: String,
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
  orderSchema.index({scheduledFinishDate: -1});
  orderSchema.index({startDate: -1});
  orderSchema.index({finishDate: -1});
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
      enteredBy: '',
      changedBy: '',
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

  orderSchema.statics.assignPkhdStrategies = function(order, done)
  {
    if (!Array.isArray(order.bom) || !order.bom.length)
    {
      return done(null, order);
    }

    const ids = (order.bom || [])
      .filter(c => !!c.nc12 && !!c.supplyArea)
      .map(component => ({
        nc: component.nc12,
        sa: component.supplyArea
      }));

    step(
      function()
      {
        mongoose.model('PkhdComponent').find({_id: {$in: ids}}).lean().exec(this.next());
      },
      function(err, pkhdComponents)
      {
        if (err)
        {
          return this.skip(err);
        }

        const strategyIds = new Map();

        this.strategies = new Map();

        pkhdComponents.forEach(pkhdComponent =>
        {
          const key = `${pkhdComponent.s}:${pkhdComponent.t}`;

          strategyIds.set(key, {
            s: pkhdComponent.s,
            t: pkhdComponent.t
          });

          if (!this.strategies.has(key))
          {
            this.strategies.set(key, []);
          }

          this.strategies.get(key).push(pkhdComponent._id.nc);
        });

        if (strategyIds.size === 0)
        {
          return this.skip();
        }

        mongoose.model('PkhdStrategy')
          .find({$or: Array.from(strategyIds.values())}, {_id: 0})
          .lean()
          .exec(this.next());
      },
      function(err, pkhdStrategies)
      {
        if (err)
        {
          return this.skip(err);
        }

        const nc12ToStrategy = new Map();

        pkhdStrategies.forEach(pkhdStrategy =>
        {
          this.strategies.get(`${pkhdStrategy.s}:${pkhdStrategy.t}`).forEach(nc12 =>
          {
            nc12ToStrategy.set(nc12, pkhdStrategy.name);
          });
        });

        order.bom.forEach(component =>
        {
          component.distStrategy = nc12ToStrategy.get(component.nc12) || '';
        });
      },
      function(err)
      {
        done(err, order);
      }
    );
  };

  mongoose.model('Order', orderSchema);
};

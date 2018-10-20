// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const resolveProductName = require('../modules/util/resolveProductName');
const resolveBestOperation = require('../modules/util/resolveBestOperation');

const OPERATION_PROPERTIES = [
  'no',
  'name',
  'machineSetupTime',
  'laborSetupTime',
  'machineTime',
  'laborTime',
  'workCenter'
];

module.exports = function setupPlanModel(app, mongoose)
{
  const planOrderSchema = new mongoose.Schema({
    _id: String,
    kind: {
      type: String,
      enum: ['unclassified', 'small', 'easy', 'hard']
    },
    date: String,
    mrp: String,
    nc12: String,
    name: String,
    statuses: [String],
    operation: {
      no: String,
      name: String,
      machineSetupTime: Number,
      laborSetupTime: Number,
      machineTime: Number,
      laborTime: Number,
      workCenter: String
    },
    manHours: Number,
    hardComponent: String,
    quantityTodo: Number,
    quantityDone: Number,
    quantityPlan: Number,
    lines: [String],
    incomplete: Number,
    ignored: Boolean,
    urgent: Boolean,
    source: {
      type: String,
      enum: ['plan', 'added', 'incomplete', 'late'],
      default: 'plan'
    }
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planLineOrderSchema = new mongoose.Schema({
    _id: String,
    orderNo: String,
    quantity: Number,
    pceTime: Number,
    manHours: Number,
    startAt: Date,
    finishAt: Date,
    pceTimes: [Number]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const autoDowntimeSchema = new mongoose.Schema({
    reason: String,
    startAt: Date,
    duration: Number
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const shiftDataSchema = new mongoose.Schema({
    manHours: Number,
    quantity: Number,
    orderCount: Number
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const frozenOrderSchema = new mongoose.Schema({
    orderNo: String,
    quantity: Number
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planLineSchema = new mongoose.Schema({
    _id: String,
    version: Number,
    hash: String,
    orders: [planLineOrderSchema],
    downtimes: [autoDowntimeSchema],
    hourlyPlan: [Number],
    shiftData: [shiftDataSchema],
    frozenOrders: [frozenOrderSchema]
  }, {
    _id: false,
    minimize: false,
    retainKeyOrder: true
  });

  const planSchema = new mongoose.Schema({
    _id: Date,
    createdAt: Date,
    updatedAt: Date,
    frozen: {
      type: Boolean,
      default: false
    },
    orders: [planOrderSchema],
    lines: [planLineSchema]
  }, {
    id: false,
    minimize: false,
    retainKeyOrder: true
  });

  planSchema.index({'orders._id': -1});

  planSchema.statics.TOPIC_PREFIX = 'planning.plans';
  planSchema.statics.BROWSE_LIMIT = 10;

  planSchema.statics.SAP_ORDER_FIELDS = {
    scheduledStartDate: 1,
    mrp: 1,
    nc12: 1,
    name: 1,
    description: 1,
    qty: 1,
    'qtyDone.total': 1,
    'qtyDone.byOperation': 1,
    statuses: 1,
    operations: 1,
    'bom.nc12': 1
  };

  planSchema.statics.OPERATION_PROPERTIES = OPERATION_PROPERTIES;

  planSchema.pre('save', function(next)
  {
    this.updatedAt = new Date();

    next();
  });

  planSchema.statics.createPlanOrder = function(source, sapOrder, hardComponents)
  {
    const operation = _.pick(resolveBestOperation(sapOrder.operations), OPERATION_PROPERTIES);

    if (operation && app.orders && app.orders.getGroupedOperations)
    {
      app.orders.getGroupedOperations(sapOrder.operations, operation.no).forEach(op =>
      {
        if (op.no !== operation.no)
        {
          operation.machineSetupTime += op.machineSetupTime;
          operation.machineTime += op.machineTime;
          operation.laborSetupTime += op.laborSetupTime;
          operation.laborTime += op.laborTime;
        }
      });
    }

    const hardComponent = !hardComponents || !Array.isArray(sapOrder.bom) || sapOrder.bom.length === 0
      ? null
      : sapOrder.bom.find(component => hardComponents.has(component.nc12));
    let quantityDone = 0;

    if (sapOrder.qtyDone)
    {
      if (operation && sapOrder.qtyDone.byOperation)
      {
        quantityDone = sapOrder.qtyDone.byOperation[operation.no] || 0;
      }
      else if (sapOrder.total)
      {
        quantityDone = sapOrder.total;
      }
    }

    return {
      _id: sapOrder._id,
      kind: 'unclassified',
      date: moment(sapOrder.scheduledStartDate).format('YYYY-MM-DD'),
      mrp: sapOrder.mrp,
      nc12: sapOrder.nc12,
      name: resolveProductName(sapOrder),
      statuses: sapOrder.statuses,
      operation,
      manHours: 0,
      hardComponent: hardComponent ? hardComponent.nc12 : null,
      quantityTodo: sapOrder.qty,
      quantityDone,
      quantityPlan: 0,
      lines: [],
      incomplete: 0,
      ignored: false,
      urgent: false,
      source
    };
  };

  mongoose.model('Plan', planSchema);
};

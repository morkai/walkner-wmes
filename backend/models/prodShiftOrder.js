'use strict';

module.exports = function setupProdShiftOrderModel(app, mongoose)
{
  var prodShiftOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    prodShift: {
      type: String,
      ref: 'ProdShift',
      default: null
    },
    division: {
      type: String,
      ref: 'Division',
      default: null
    },
    subdivision: {
      type: String,
      ref: 'Subdivision',
      default: null
    },
    mrpControllers: [{
      type: 'String',
      ref: 'MrpController'
    }],
    prodFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProdFlow',
      default: null
    },
    workCenter: {
      type: String,
      ref: 'WorkCenter',
      default: null
    },
    prodLine: {
      type: String,
      ref: 'ProdLine',
      required: true
    },
    date: {
      type: Date,
      trim: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    mechOrder: {
      type: Boolean,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    operationNo: {
      type: String,
      required: true
    },
    orderData: {},
    workerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    quantityDone: {
      type: Number,
      default: 0,
      min: 0
    },
    losses: {
      type: {},
      default: null
    },
    creator: {},
    startedAt: {
      type: Date,
      required: true
    },
    finishedAt: {
      type: Date,
      default: null
    }
  }, {
    id: false
  });

  prodShiftOrderSchema.statics.TOPIC_PREFIX = 'prodShiftOrders';

  mongoose.model('ProdShiftOrder', prodShiftOrderSchema);
};

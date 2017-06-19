// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupMechOrderModel(app, mongoose)
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

  var mechOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    operations: [operationSchema],
    mrp: {
      type: String,
      ref: 'MrpController',
      default: null
    },
    materialNorm: {
      type: Number
    },
    importTs: Date
  }, {
    id: false
  });

  mechOrderSchema.statics.TOPIC_PREFIX = 'mechOrders';

  mongoose.model('MechOrder', mechOrderSchema);
};

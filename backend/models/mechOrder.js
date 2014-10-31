// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

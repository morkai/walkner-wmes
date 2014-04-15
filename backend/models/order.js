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
    newValues: {}
  }, {
    _id: false
  });

  var orderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
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
    operations: [operationSchema],
    changes: [changeSchema],
    importTs: Date
  }, {
    id: false
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.index({nc12: 1, finishDate: -1});
  orderSchema.index({finishDate: -1});
  orderSchema.index({startDate: -1, mrp: 1});

  orderSchema.pre('save', function(next)
  {
    /*jshint validthis:true*/

    if (this.isNew)
    {
      this.createdAt = new Date();
    }
    else
    {
      this.updatedAt = new Date();
    }

    if (this.startDate)
    {
      this.tzOffsetMs = this.startDate.getTimezoneOffset() * 60 * 1000 * -1;
    }

    next();
  });

  mongoose.model('Order', orderSchema);
};

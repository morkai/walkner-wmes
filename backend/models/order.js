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
    statuses: [String],
    operations: [operationSchema],
    changes: [changeSchema]
  }, {
    id: false
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.index({nc12: 1});

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

    next();
  });

  mongoose.model('Order', orderSchema);
};

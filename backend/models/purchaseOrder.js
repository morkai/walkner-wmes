// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupPurchaseOrderModel(app, mongoose)
{
  var purchaseOrderItemScheduleSchema = mongoose.Schema({
    date: Date,
    qty: Number
  }, {
    _id: false
  });

  var purchaseOrderItemSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    qty: Number,
    unit: String,
    nc12: String,
    name: String,
    schedule: [purchaseOrderItemScheduleSchema],
    completed: {
      type: Boolean,
      default: false
    },
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredQty: {
      type: Number,
      default: 0,
      min: 0
    }
  }, {
    _id: false
  });

  purchaseOrderItemSchema.pre('save', function(next)
  {
    this.delivered = this.deliveredQty === this.qty;

    next();
  });

  var changeSchema = mongoose.Schema({
    date: Date,
    user: {},
    data: {}
  }, {
    _id: false
  });

  var purchaseOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true
    },
    importedAt: {
      type: Date,
      required: true
    },
    createdAt: Date,
    updatedAt: Date,
    pOrg: {
      type: String,
      required: true
    },
    pGr: {
      type: String,
      required: true
    },
    plant: {
      type: String,
      required: true
    },
    docDate: {
      type: Date,
      required: true
    },
    vendor: {
      type: String,
      required: true,
      ref: 'Vendor'
    },
    vendorName: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      default: true
    },
    items: [purchaseOrderItemSchema],
    changes: [changeSchema]
  }, {
    id: false
  });

  purchaseOrderSchema.statics.TOPIC_PREFIX = 'purchaseOrders';

  purchaseOrderSchema.index({'items.nc12': 1, 'items.schedule.date': -1});
  purchaseOrderSchema.index({vendor: 1, 'items.schedule.date': -1});
  purchaseOrderSchema.index({vendor: 1, 'items.nc12': 1, 'items.schedule.date': -1});
  purchaseOrderSchema.index({open: 1, 'items.schedule.date': -1});
  purchaseOrderSchema.index({open: 1, vendor: 1, 'items.schedule.date': -1});

  purchaseOrderSchema.pre('save', function(next)
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

  mongoose.model('PurchaseOrder', purchaseOrderSchema);
};

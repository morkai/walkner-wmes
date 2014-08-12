// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupPurchaseOrderModel(app, mongoose)
{
  var BARCODES = {
    qr: 58,
    code128: 20
  };
  var PAPERS = {
    'a4': {
      width: 210,
      height: 297,
      options: '-O Landscape -B 0 -L 30mm -R 30mm -T 30mm',
      qr: '--scale=7 --vers=5',
      code128: '--scale=1 --height=259'
    },
    '104x42': {
      width: 42,
      height: 105,
      options: '-O Landscape -B 0 -L 10mm -R 10mm -T 1mm',
      qr: '--scale=3 --vers=5',
      code128: '--scale=1 --height=95'
    }
  };

  var purchaseOrderItemScheduleSchema = mongoose.Schema({
    date: Date,
    qty: Number
  }, {
    _id: false
  });

  var purchaseOrderItemPrintSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    printedAt: {
      type: Date,
      required: true
    },
    printedBy: {},
    paper: {
      type: String,
      required: true,
      enum: Object.keys(PAPERS)
    },
    barcode: {
      type: String,
      required: true,
      enum: Object.keys(BARCODES)
    },
    shippingNo: {
      type: String,
      default: ''
    },
    packageQty: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    componentQty: {
      type: Number,
      required: true,
      min: 1,
      max: 999999
    },
    remainingQty: {
      type: Number,
      required: true,
      min: 0
    },
    totalQty: {
      type: Number,
      required: true,
      min: 1
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {},
    cancelled: {
      type: Boolean,
      default: false
    }
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
    prints: [purchaseOrderItemPrintSchema],
    printedQty: {
      type: Number,
      default: 0,
      min: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }, {
    _id: false
  });

  purchaseOrderItemSchema.methods.recountQty = function()
  {
    var totalPrintedQty = 0;

    this.prints.forEach(function(print)
    {
      if (!print.cancelled)
      {
        totalPrintedQty += print.totalQty;
      }
    });

    this.printedQty = totalPrintedQty;
  };

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
    qty: {
      type: Number,
      default: 0
    },
    printedQty: {
      type: Number,
      default: 0
    },
    items: [purchaseOrderItemSchema],
    changes: [changeSchema]
  }, {
    id: false
  });

  purchaseOrderSchema.statics.TOPIC_PREFIX = 'purchaseOrders';
  purchaseOrderSchema.statics.BARCODES = BARCODES;
  purchaseOrderSchema.statics.PAPERS = PAPERS;

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

    if (this.isNew || this.isModified('items'))
    {
      this.recountQty();
    }

    next();
  });

  purchaseOrderSchema.methods.recountQty = function()
  {
    var totalQty = 0;
    var totalPrintedQty = 0;

    this.items.forEach(function(item)
    {
      item.recountQty();

      totalQty += item.qty;
      totalPrintedQty += item.printedQty;
    });

    this.qty = totalQty;
    this.printedQty = totalPrintedQty;
  };

  mongoose.model('PurchaseOrder', purchaseOrderSchema);
};

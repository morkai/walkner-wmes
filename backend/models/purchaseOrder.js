// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

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
      wkhtmltopdf: '-O Landscape -B 0 -L 30mm -R 30mm -T 30mm',
      qr: {
        zint: '--scale=3.5 --vers=5'
      },
      code128: {
        zint: '--scale=0.5 --height=259'
      }
    },
    '104x42': {
      width: 42,
      height: 105,
      wkhtmltopdf: '-O Landscape -B 0 -L 10mm -R 10mm -T 3mm',
      qr: {
        zint: '--scale=1.5 --vers=5'
      },
      code128: {
        zint: '--scale=0.5 --height=95',
        maxLength: 40
      }
    }
  };

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

  purchaseOrderItemSchema.methods.getScheduledAt = function()
  {
    if (this.completed)
    {
      return -1;
    }

    var scheduledAt = Number.MAX_VALUE;

    lodash.forEach(this.schedule, function(schedule)
    {
      scheduledAt = Math.min(scheduledAt, schedule.date.getTime());
    });

    return scheduledAt;
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
      required: true
    },
    importedAt: {
      type: Date,
      required: true
    },
    createdAt: Date,
    updatedAt: Date,
    scheduledAt: Date,
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

  purchaseOrderSchema.index({'items.nc12': 1, scheduledAt: -1});
  purchaseOrderSchema.index({vendor: 1, scheduledAt: -1});
  purchaseOrderSchema.index({vendor: 1, 'items.nc12': 1, scheduledAt: -1});
  purchaseOrderSchema.index({open: 1, scheduledAt: -1});
  purchaseOrderSchema.index({open: 1, vendor: 1, scheduledAt: -1});
  purchaseOrderSchema.index({pGr: 1, open: 1});

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

    if (this.isNew)
    {
      this.recountItems();
      next();
    }
    else if (this.isModified('items'))
    {
      var purchaseOrder = this;

      this.recountPrints(function(err)
      {
        if (err)
        {
          return next(err);
        }

        purchaseOrder.recountItems();
        next();
      });
    }
    else
    {
      next();
    }
  });

  purchaseOrderSchema.methods.recountItems = function()
  {
    var scheduledAt = Number.MAX_VALUE;
    var totalQty = 0;
    var totalPrintedQty = 0;

    lodash.forEach(this.items, function(item)
    {
      totalQty += item.qty;
      totalPrintedQty += item.printedQty;

      var itemScheduledAt = item.getScheduledAt();

      if (itemScheduledAt !== -1 && itemScheduledAt < scheduledAt)
      {
        scheduledAt = itemScheduledAt;
      }
    });

    this.scheduledAt = scheduledAt === Number.MAX_VALUE ? null : scheduledAt;
    this.qty = totalQty;
    this.printedQty = totalPrintedQty;
  };

  purchaseOrderSchema.methods.recountPrints = function(done)
  {
    var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');
    var itemMap = {};

    lodash.forEach(this.items, function(item)
    {
      item.printedQty = 0;
      itemMap[item._id] = item;
    });

    var conditions = {
      purchaseOrder: this._id,
      cancelled: false
    };
    var fields = {
      item: 1,
      totalQty: 1
    };

    PurchaseOrderPrint.find(conditions, fields).sort({printedAt: 1}).lean().exec(function(err, prints)
    {
      if (err)
      {
        return done(err);
      }

      lodash.forEach(prints, function(print)
      {
        var item = itemMap[print.item];

        if (item)
        {
          item.printedQty += print.totalQty;
        }
      });

      done();
    });
  };

  mongoose.model('PurchaseOrder', purchaseOrderSchema);
};

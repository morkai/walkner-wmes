// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupPurchaseOrderPrintModel(app, mongoose)
{
  var purchaseOrderPrintSchema = mongoose.Schema({
    key: {
      type: String,
      required: true
    },
    purchaseOrder: {
      type: String,
      required: true,
      ref: 'PurchaseOrder'
    },
    vendor: {
      type: String,
      required: true
    },
    item: {
      type: String,
      required: true
    },
    nc12: {
      type: String,
      default: ''
    },
    printedAt: {
      type: Date,
      required: true
    },
    printedBy: {},
    printer: {
      type: String,
      required: true
    },
    paper: {
      type: String,
      required: true
    },
    barcode: {
      type: String,
      required: true
    },
    shippingNo: {
      type: String,
      default: ''
    },
    packageQty: {
      type: Number,
      required: true,
      min: 0
    },
    componentQty: {
      type: Number,
      required: true,
      min: 0
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
    cancelledBy: {
      type: Object,
      default: null
    },
    cancelled: {
      type: Boolean,
      default: false
    }
  }, {
    id: false
  });

  purchaseOrderPrintSchema.statics.TOPIC_PREFIX = 'purchaseOrderPrints';

  purchaseOrderPrintSchema.index({key: 1, vendor: 1});
  purchaseOrderPrintSchema.index({purchaseOrder: 1, vendor: 1});
  purchaseOrderPrintSchema.index({itemNc12: 1, vendor: 1});

  mongoose.model('PurchaseOrderPrint', purchaseOrderPrintSchema);
};

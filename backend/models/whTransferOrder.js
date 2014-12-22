// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupWhTransferOrderModel(app, mongoose)
{
  var whTransferOrderSchema = mongoose.Schema({
    _id: {
      no: String,
      item: Number
    },
    plant: String,
    confirmedAt: Date,
    nc12: String,
    name: String,
    srcType: Number,
    srcBin: String,
    reqNo: String,
    dstType: Number,
    dstBin: String,
    srcTgtQty: Number,
    unit: String,
    mvmtWm: Number,
    mvmtIm: Number,
    shiftDate: Date,
    s: Number
  }, {
    id: false,
    versionKey: false
  });

  whTransferOrderSchema.index({nc12: 1, shiftDate: 1});

  mongoose.model('WhTransferOrder', whTransferOrderSchema);
};

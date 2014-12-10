// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupWhTransferOrderArchiveModel(app, mongoose)
{
  var whTransferOrderArchiveSchema = mongoose.Schema({
    _id: {
      ts: Date,
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
    mvmtIm: Number
  }, {
    id: false,
    versionKey: false
  });

  mongoose.model('WhTransferOrderArchive', whTransferOrderArchiveSchema);
};

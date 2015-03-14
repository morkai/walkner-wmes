// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfLedOrderModel(app, mongoose)
{
  var xiconfLedOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    reqDate: Date,
    name: String,
    nc12: String,
    quantityParent: Number,
    quantityTodo: Number,
    quantityDone: Number,
    serialNos: [Number],
    importedAt: Date,
    createdAt: Date,
    finishedAt: Date
  }, {
    id: false
  });

  xiconfLedOrderSchema.index({serialNos: 1});
  xiconfLedOrderSchema.index({reqDate: -1});

  mongoose.model('XiconfLedOrder', xiconfLedOrderSchema);
};

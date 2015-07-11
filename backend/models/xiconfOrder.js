// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfOrderModel(app, mongoose)
{
  var xiconfOrderItemSchema = mongoose.Schema({
    kind: {
      type: String,
      enum: ['program', 'led', 'gprs', 'test']
    },
    nc12: String,
    name: String,
    quantityTodo: Number,
    quantityDone: Number,
    extraQuantityDone: Number,
    serialNumbers: [String]
  }, {
    _id: false
  });

  var xiconfOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    startDate: Date,
    finishDate: Date,
    reqDate: Date,
    name: String,
    nc12: [String],
    quantityTodo: Number,
    quantityDone: Number,
    status: Number,
    serviceTagCounter: Number,
    items: [xiconfOrderItemSchema],
    startedAt: Date,
    finishedAt: Date,
    importedAt: Date
  }, {
    id: false
  });

  xiconfOrderSchema.index({startDate: -1});
  xiconfOrderSchema.index({finishDate: -1});
  xiconfOrderSchema.index({reqDate: -1});
  xiconfOrderSchema.index({status: 1});
  xiconfOrderSchema.index({nc12: 1});
  xiconfOrderSchema.index({'items.serialNumbers': 1});

  mongoose.model('XiconfOrder', xiconfOrderSchema);
};

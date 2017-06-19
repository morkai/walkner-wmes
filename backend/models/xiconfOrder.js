// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupXiconfOrderModel(app, mongoose)
{
  const xiconfOrderItemSchema = new mongoose.Schema({
    source: {
      type: String,
      enum: ['xiconf', 'docs'],
      default: 'xiconf'
    },
    kind: {
      type: String,
      enum: ['program', 'led', 'gprs', 'test', 'hid', 'weight']
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

  const xiconfOrderSchema = new mongoose.Schema({
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

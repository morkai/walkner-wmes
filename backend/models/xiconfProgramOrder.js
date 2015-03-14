// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfProgramOrderModel(app, mongoose)
{
  var xiconfProgramOrderNc12Schema = mongoose.Schema({
    _id: String,
    name: String,
    quantityTodo: Number,
    quantityDone: Number
  }, {
    id: false
  });

  var xiconfProgramOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      trim: true
    },
    reqDate: Date,
    nc12: [xiconfProgramOrderNc12Schema],
    quantityParent: Number,
    quantityTodo: Number,
    quantityDone: Number,
    serviceTagCounter: Number,
    status: Number,
    importedAt: Date,
    createdAt: Date,
    finishedAt: Date
  }, {
    id: false
  });

  xiconfProgramOrderSchema.index({reqDate: -1});
  xiconfProgramOrderSchema.index({'nc12._id': 1});
  xiconfProgramOrderSchema.index({status: 1});

  mongoose.model('XiconfProgramOrder', xiconfProgramOrderSchema);
};

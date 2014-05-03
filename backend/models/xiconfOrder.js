// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfOrderModel(app, mongoose)
{
  var xiconfOrderSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    no: String,
    quantity: Number,
    successCounter: Number,
    failureCounter: Number,
    startedAt: Date,
    finishedAt: Date,
    duration: Number,
    srcIp: String,
    srcId: String,
    srcTitle: String,
    srcUuid: String
  }, {
    id: false
  });

  xiconfOrderSchema.index({no: 1, startedAt: -1});
  xiconfOrderSchema.index({startedAt: -1});

  mongoose.model('XiconfOrder', xiconfOrderSchema);
};

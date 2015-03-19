// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupXiconfOrderResultModel(app, mongoose)
{
  var xiconfOrderResultSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
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

  xiconfOrderResultSchema.index({no: 1});
  xiconfOrderResultSchema.index({startedAt: -1});

  mongoose.model('XiconfOrderResult', xiconfOrderResultSchema);
};

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOrderDocumentStatusModel(app, mongoose)
{
  var orderDocumentStatusModel = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    statusDate: {
      type: Number,
      required: true
    },
    files: [String]
  }, {
    id: false
  });

  mongoose.model('OrderDocumentStatus', orderDocumentStatusModel);
};

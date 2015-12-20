// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setupOrderIntakeModel(app, mongoose)
{
  var orderIntakeSchema = mongoose.Schema({
    _id: {
      no: String,
      item: String
    },
    nc12: String,
    description: String,
    qty: Number,
    soldToParty: String,
    shipTo: String
  }, {
    id: false
  });

  mongoose.model('OrderIntake', orderIntakeSchema);
};

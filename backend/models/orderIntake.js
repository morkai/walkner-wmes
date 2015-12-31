// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

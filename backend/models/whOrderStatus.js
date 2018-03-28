// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupWhOrderStatusModel(app, mongoose)
{
  const whOrderStatusSchema = new mongoose.Schema({
    _id: Date,
    orders: {}
  }, {
    id: false,
    retainKeyOrder: true,
    minimize: false
  });

  mongoose.model('WhOrderStatus', whOrderStatusSchema);
};

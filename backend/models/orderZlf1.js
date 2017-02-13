// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setupOrderZlf1Model(app, mongoose)
{
  const orderZlf1Schema = new mongoose.Schema({
    _id: String
  }, {
    id: false,
    minimize: false,
    strict: false
  });

  orderZlf1Schema.statics.prepareForInsert = function(data)
  {
    var orderZlf1 = {};

    Object.keys(data).forEach(function(key)
    {
      var value = data[key].trim();

      key = key.toLowerCase().replace(/[^a-z0-9_]+/g, ' ').trim().replace(/(\s|_)+/g, '_');

      if (!key.length)
      {
        return;
      }


      if (key === 'production_order_nr')
      {
        key = '_id';
        value = value.replace(/^0+/, '');
      }

      orderZlf1[key] = value;
    });

    return orderZlf1;
  };

  mongoose.model('OrderZlf1', orderZlf1Schema);
};

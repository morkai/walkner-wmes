// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const resolveProductName = require('../../util/resolveProductName');

module.exports = function findOrderRoute(app, qiModule, req, res, next)
{
  const mongoose = app[qiModule.config.mongooseId];
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');

  const orderNo = req.query.no;
  const conditions = {
    orderId: orderNo,
    'orderData.no': orderNo
  };
  const fields = {
    division: 1,
    'orderData.name': 1,
    'orderData.description': 1,
    'orderData.nc12': 1,
    'orderData.qty': 1
  };

  ProdShiftOrder.findOne(conditions, fields).lean().exec(function(err, pso)
  {
    if (err)
    {
      return next(err);
    }

    if (!pso)
    {
      return res.sendStatus(404);
    }

    const orderData = pso.orderData;
    const name = resolveProductName(orderData);
    const familyParts = name.split(' ');

    res.json({
      division: pso.division,
      orderNo: orderNo,
      nc12: orderData.nc12 || '',
      productName: name,
      productFamily: familyParts.length > 1 ? familyParts[0] : familyParts[0].substring(0, 6),
      quantity: orderData.qty || 0
    });
  });
};

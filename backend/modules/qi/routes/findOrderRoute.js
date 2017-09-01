// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
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
    prodLine: 1,
    leader: 1,
    'orderData.name': 1,
    'orderData.description': 1,
    'orderData.nc12': 1,
    'orderData.qty': 1
  };

  ProdShiftOrder.find(conditions, fields).lean().exec(function(err, psos)
  {
    if (err)
    {
      return next(err);
    }

    if (!psos.length)
    {
      return res.sendStatus(404);
    }

    const orderData = psos[0].orderData;
    const name = resolveProductName(orderData);
    const familyParts = name.split(' ');

    res.json({
      division: psos[0].division,
      lines: _.uniq(psos.map(pso => pso.prodLine))
        .sort((a, b) => a.localeCompare(b, undefined, {numeric: true})),
      leaders: _.uniqBy(psos.filter(pso => !!pso.leader).map(pso => pso.leader), 'id')
        .sort((a, b) => a.label.localeCompare(b.label)),
      orderNo: orderNo,
      nc12: orderData.nc12 || '',
      productName: name,
      productFamily: familyParts.length > 1 ? familyParts[0] : familyParts[0].substring(0, 6),
      quantity: orderData.qty || 0
    });
  });
};

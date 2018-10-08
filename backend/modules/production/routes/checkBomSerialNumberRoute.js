// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function checkBomSerialNumberRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  ProdSerialNumber.findOne({bom: req.body.sn}, {_id: 1}).hint({bom: 1}).lean().exec((err, psn) =>
  {
    if (err)
    {
      return next(err);
    }

    res.json(psn ? psn._id : null);
  });
};

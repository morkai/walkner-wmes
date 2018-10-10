// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function checkAnySerialNumberRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdSerialNumber = mongoose.model('ProdSerialNumber');

  const conditions = {};
  const hint = {};
  const sn = req.body.sn;

  if (/^[A-Z0-9]{4}\.[0-9]{9}\.[0-9]{4}$/i.test(sn))
  {
    conditions._id = sn;
    hint._id = 1;
  }
  else
  {
    conditions.bom = sn;
    hint.bom = 1;
  }

  ProdSerialNumber.findOne(conditions, {_id: 1}).hint(hint).lean().exec((err, psn) =>
  {
    if (err)
    {
      return next(err);
    }

    res.json(psn ? psn._id : null);
  });
};

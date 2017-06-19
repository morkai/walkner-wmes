// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function getLatestComponentQtyRoute(app, poModule, req, res, next)
{
  const nc12 = [].concat(req.query.nc12 || req.body.nc12).filter(function(nc12)
  {
    return typeof nc12 === 'string' && nc12.length === 12;
  });

  if (!nc12.length)
  {
    return res.json({});
  }

  const mongoose = app[poModule.config.mongooseId];
  const PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  PurchaseOrderPrint.aggregate(
    {$match: {nc12: {$in: nc12}, componentQty: {$ne: 0}}},
    {$sort: {nc12: 1, printedAt: 1}},
    {$group: {_id: '$nc12', componentQty: {$last: '$componentQty'}}},
    function(err, results)
    {
      if (err)
      {
        return next(err);
      }

      const latestComponentQty = {};

      _.forEach(results, function(result)
      {
        latestComponentQty[result._id] = result.componentQty;
      });

      res.json(latestComponentQty);
    }
  );
};

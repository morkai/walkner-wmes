// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function getLatestComponentQtyRoute(app, poModule, req, res, next)
{
  var nc12 = [].concat(req.query.nc12 || req.body.nc12).filter(function(nc12)
  {
    return typeof nc12 === 'string' && nc12.length === 12;
  });

  if (!nc12.length)
  {
    return res.json({});
  }

  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

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

      var latestComponentQty = {};

      _.forEach(results, function(result)
      {
        latestComponentQty[result._id] = result.componentQty;
      });

      res.json(latestComponentQty);
    }
  );
};

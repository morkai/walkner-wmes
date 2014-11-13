// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

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

      results.forEach(function(result)
      {
        latestComponentQty[result._id] = result.componentQty;
      });

      res.json(latestComponentQty);
    }
  );
};

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function getLatestComponentQtyRoute(PurchaseOrder, req, res, next)
{
  var nc12 = [].concat(req.query.nc12 || req.body.nc12).filter(function(nc12)
  {
    return typeof nc12 === 'string' && nc12.length === 12;
  });

  if (!nc12.length)
  {
    return res.json({});
  }

  PurchaseOrder.aggregate(
    {$match: {'items.nc12': {$in: nc12}}},
    {$unwind: '$items'},
    {$match: {'items.nc12': {$in: nc12}, 'items.prints': {$not: {$size: 0}}}},
    {$project: {_id: 0, nc12: '$items.nc12', prints: '$items.prints'}},
    {$unwind: '$prints'},
    {$match: {'prints.componentQty': {$ne: 0}}},
    {$group: {_id: '$nc12', print: {$last: '$prints'}}},
    {$project: {_id: 0, nc12: '$_id', componentQty: '$print.componentQty'}},
    function(err, results)
    {
      if (err)
      {
        return next(err);
      }

      var latestComponentQty = {};

      results.forEach(function(result)
      {
        latestComponentQty[result.nc12] = result.componentQty;
      });

      res.json(latestComponentQty);
    }
  );
};

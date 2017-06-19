// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const orderFinder = require('../orderFinder');

module.exports = function findOrdersRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const MechOrder = mongoose.model('MechOrder');

  if (typeof req.query.no === 'string' && /[0-9]{3,9}/.test(req.query.no))
  {
    return findOrdersByNo(req.query.no.match(/([0-9]{3,9})/)[1], res, next);
  }

  if (typeof req.query.nc12 === 'string' && /[a-zA-Z0-9]{3,12}/.test(req.query.nc12))
  {
    return findOrdersByNc12(req.query.nc12.match(/([a-zA-Z0-9]{3,12})/)[1], res, next);
  }

  return res.json([]);

  function findOrdersByNo(no, res, next)
  {
    orderFinder.findOrdersByNo(Order, no, function(err, orders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(orders);
    });
  }

  function findOrdersByNc12(nc12, res, next)
  {
    orderFinder.findOrdersByNc12(Order, MechOrder, nc12, function(err, mechOrders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(mechOrders);
    });
  }
};

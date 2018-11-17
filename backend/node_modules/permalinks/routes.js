// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpPermalinksRoutes(app, module)
{
  const express = app[module.config.expressId];

  express.get('/r/productionOrder/:orderNo', function(req, res)
  {
    res.redirect('/#orders/' + req.params.orderNo);
  });

  express.get('/r/xiconfOrder/:orderNo', function(req, res)
  {
    res.redirect('/#xiconf/orders/' + req.params.orderNo);
  });

  express.get('/r/prodShiftOrders/:orderNo', function(req, res)
  {
    res.redirect('/#prodShiftOrders?sort(startedAt)&orderId=string:' + req.params.orderNo);
  });
};

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpPermalinksRoutes(app, module)
{
  var express = app[module.config.expressId];

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

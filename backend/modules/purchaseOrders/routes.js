// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function setUpPurchaseOrdersRoutes(app, poModule)
{
  var express = app[poModule.config.expressId];
  var auth = app[poModule.config.userId].auth;
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var canView = auth('PURCHASE_ORDERS:VIEW');

  express.get(
    '/purchaseOrders',
    canView,
    limitToVendor,
    express.crud.browseRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders/:id',
    canView,
    limitToVendor,
    express.crud.readRoute.bind(null, app, PurchaseOrder)
  );

  function limitToVendor(req, res, next)
  {
    var user = req.session.user;

    if (!user.vendor)
    {
      return next();
    }

    var selectors = req.rql.selector.args;
    var vendorTerm = lodash.find(selectors, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'vendor';
    });

    if (!vendorTerm)
    {
      vendorTerm = {name: 'eq', args: ['vendor', null]};

      selectors.unshift(vendorTerm);
    }

    vendorTerm.args[1] = user.vendor;

    next();
  }
};

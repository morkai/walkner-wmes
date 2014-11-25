// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var limitToVendor = require('./limitToVendor');
var importRoute = require('./importRoute');
var getLatestComponentQtyRoute = require('./getLatestComponentQtyRoute');
var addPrintsRoute = require('./addPrintsRoute');
var cancelPrintRoute = require('./cancelPrintRoute');
var renderLabelRoute = require('./renderLabelRoute');
var renderLabelHtmlRoute = require('./renderLabelHtmlRoute');

module.exports = function setUpPurchaseOrdersRoutes(app, poModule)
{
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  var canView = userModule.auth('PURCHASE_ORDERS:VIEW');
  var canManage = userModule.auth('PURCHASE_ORDERS:MANAGE');

  express.get(
    '/purchaseOrders',
    canView,
    limitToVendor,
    express.crud.browseRoute.bind(null, app, PurchaseOrder)
  );

  express.post(
    '/purchaseOrders;import',
    importRoute.bind(null, app, poModule)
  );

  express.get(
    '/purchaseOrders;getLatestComponentQty',
    canManage,
    getLatestComponentQtyRoute.bind(null, app, poModule)
  );

  express.get(
    '/purchaseOrders;renderLabelHtml',
    userModule.auth('LOCAL', 'PURCHASE_ORDERS:MANAGE'),
    renderLabelHtmlRoute.bind(null, app, poModule)
  );

  express.get(
    '/purchaseOrders/:id',
    canView,
    limitToVendor,
    express.crud.readRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders/:orderId/prints',
    canView,
    limitToVendor,
    function limitToOrder(req, res, next)
    {
      var orderTerm = lodash.find(req.rql.selector.args, function(term)
      {
        return term.name === 'eq' && term.args[0] === 'purchaseOrder';
      });

      if (orderTerm)
      {
        orderTerm.args[1] = req.params.orderId;
      }
      else
      {
        req.rql.selector.args.push({
          name: 'eq',
          args: ['purchaseOrder', req.params.orderId]
        });
      }

      next();
    },
    express.crud.browseRoute.bind(null, app, PurchaseOrderPrint)
  );

  express.post(
    '/purchaseOrders/:orderId/prints',
    canManage,
    addPrintsRoute.bind(null, app, poModule)
  );

  express.post(
    '/purchaseOrders/:orderId/prints/:printId;cancel',
    canManage,
    cancelPrintRoute.bind(null, app, poModule)
  );

  express.get(
    /^\/purchaseOrders\/([0-9]+)\/prints\/([A-F0-9]{32}|[a-f0-9]{24})\.(pdf\+html|pdf|html)$/,
    canView,
    function prepareParams(req, res, next)
    {
      req.params.orderId = req.params[0];
      req.params.printId = req.params[1];
      req.params.format = req.params[2];

      next();
    },
    renderLabelRoute.bind(null, app, poModule)
  );
};

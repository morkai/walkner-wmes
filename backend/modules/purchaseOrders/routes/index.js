// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var limitToVendor = require('./limitToVendor');
var getLatestComponentQtyRoute = require('./getLatestComponentQtyRoute');
var togglePrintCancelRoute = require('./togglePrintCancelRoute');
var getLabelPdfRoute = require('./getLabelPdfRoute');
var renderLabelPdfRoute = require('./renderLabelPdfRoute');
var renderLabelHtmlRoute = require('./renderLabelHtmlRoute');

module.exports = function setUpPurchaseOrdersRoutes(app, poModule)
{
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var canView = userModule.auth('PURCHASE_ORDERS:VIEW');
  var canManage = userModule.auth('PURCHASE_ORDERS:MANAGE');

  express.get(
    '/purchaseOrders',
    canView,
    limitToVendor,
    express.crud.browseRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders;getLatestComponentQty',
    canManage,
    getLatestComponentQtyRoute.bind(null, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders/:id',
    canView,
    limitToVendor,
    express.crud.readRoute.bind(null, app, PurchaseOrder)
  );

  express.post(
    '/purchaseOrders/:orderId/prints;cancel',
    canManage,
    togglePrintCancelRoute.bind(null, app, poModule)
  );

  express.get(
    '/purchaseOrders/:orderId/prints/:printId',
    canView,
    getLabelPdfRoute.bind(null, app, poModule)
  );

  express.post(
    '/purchaseOrders/:orderId/prints',
    canManage,
    renderLabelPdfRoute.bind(null, app, poModule)
  );

  express.get(
    '/purchaseOrders;renderLabelHtml',
    userModule.auth('LOCAL', 'PURCHASE_ORDERS:MANAGE'),
    renderLabelHtmlRoute.bind(null, app, poModule)
  );
};

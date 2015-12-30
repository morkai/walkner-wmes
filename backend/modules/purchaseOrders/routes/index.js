// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var limitToVendor = require('./limitToVendor');
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
  var VendorNc12 = mongoose.model('VendorNc12');
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
    express.crud.readRoute.bind(null, app, {
      model: PurchaseOrder,
      prepareResult: populateVendorNc12s
    })
  );

  express.get(
    '/purchaseOrders/:orderId/prints',
    canView,
    limitToVendor,
    function limitToOrder(req, res, next)
    {
      var orderTerm = _.find(req.rql.selector.args, function(term)
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
    function prepareParams(req, res, next)
    {
      req.params.orderId = req.params[0];
      req.params.printId = req.params[1];
      req.params.format = req.params[2];

      next();
    },
    renderLabelRoute.bind(null, app, poModule)
  );

  function populateVendorNc12s(po, done)
  {
    if (po.toJSON)
    {
      po = po.toJSON();
    }

    po.anyVendorNc12 = false;

    var nc12Map = {};

    for (var i = 0; i < po.items.length; ++i)
    {
      var item = po.items[i];
      var nc12 = item.nc12;

      if (!nc12)
      {
        continue;
      }

      if (!nc12Map[nc12])
      {
        nc12Map[nc12] = [];
      }

      nc12Map[nc12].push(item);
    }

    var nc12List = Object.keys(nc12Map);

    if (!nc12List.length)
    {
      return done(null, po);
    }

    step(
      function findVendorNc12sStep()
      {
        VendorNc12.find({vendor: po.vendor, nc12: {$in: nc12List}}, {_id: 0, vendor: 0}).lean().exec(this.next());
      },
      function assignVendorNc12sStep(err, vendorNc12s)
      {
        if (err)
        {
          return done(err);
        }

        po.anyVendorNc12 = vendorNc12s.length > 0;

        for (var i = 0; i < vendorNc12s.length; ++i)
        {
          var vendorNc12 = vendorNc12s[i];
          var items = nc12Map[vendorNc12.nc12];

          vendorNc12.nc12 = undefined;

          for (var ii = 0; ii < items.length; ++ii)
          {
            items[ii].vendorNc12 = vendorNc12;
          }
        }

        return done(null, po);
      }
    );
  }
};

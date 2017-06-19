// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const limitToVendor = require('./limitToVendor');
const getLatestComponentQtyRoute = require('./getLatestComponentQtyRoute');
const addPrintsRoute = require('./addPrintsRoute');
const cancelPrintRoute = require('./cancelPrintRoute');
const renderLabelRoute = require('./renderLabelRoute');
const renderLabelHtmlRoute = require('./renderLabelHtmlRoute');

module.exports = function setUpPurchaseOrdersRoutes(app, poModule)
{
  const express = app[poModule.config.expressId];
  const userModule = app[poModule.config.userId];
  const mongoose = app[poModule.config.mongooseId];
  const VendorNc12 = mongoose.model('VendorNc12');
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  const canView = userModule.auth('PURCHASE_ORDERS:VIEW');
  const canManage = userModule.auth('PURCHASE_ORDERS:MANAGE');

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
      const orderTerm = _.find(req.rql.selector.args, function(term)
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

    const nc12Map = {};

    for (let i = 0; i < po.items.length; ++i)
    {
      const item = po.items[i];
      const nc12 = item.nc12;

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

    const nc12List = Object.keys(nc12Map);

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

        for (let i = 0; i < vendorNc12s.length; ++i)
        {
          const vendorNc12 = vendorNc12s[i];
          const items = nc12Map[vendorNc12.nc12];

          vendorNc12.nc12 = undefined;

          for (let ii = 0; ii < items.length; ++ii)
          {
            items[ii].vendorNc12 = vendorNc12;
          }
        }

        return done(null, po);
      }
    );
  }
};

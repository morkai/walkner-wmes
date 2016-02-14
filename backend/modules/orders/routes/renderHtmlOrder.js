// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');

module.exports = function renderHtmlOrderRoute(app, ordersModule, req, res, next)
{
  var DATE_FORMAT = 'DD.MM.YYYY';
  var EXTRA_ROWS = {
    Firefox: 1,
    Edge: 1,
    Trident: 1,
    wkhtmltopdf: 19
  };
  var USER_AGENT_RE = new RegExp('(' + _.keys(EXTRA_ROWS).join('|') + ')');

  var express = app[ordersModule.config.expressId];
  var Order = app[ordersModule.config.mongooseId].model('Order');

  var orderNos = req.params.id.split(/[^0-9]/).filter(function(d) { return !!d.length; });

  if (!orderNos.length)
  {
    return next(express.createHttpError('INVALID_ORDER_NO'));
  }

  var templateData = {
    dateCreated: moment().format(DATE_FORMAT),
    orders: null
  };

  step(
    function findOrdersStep()
    {
      Order.find({_id: {$in: orderNos}}, {changes: 0}).lean().exec(this.next());
    },
    function handleOrdersStep(err, orders)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (orders.length !== orderNos.length)
      {
        return this.skip(express.createHttpError('ORDER_NOT_FOUND'), 404);
      }

      var orderMap = {};

      _.forEach(orders, function(order) { orderMap[order._id] = order; });

      var userAgent = req.headers['user-agent'] || '';
      var extraRows = EXTRA_ROWS[(userAgent.match(USER_AGENT_RE) || [null, 'Chrome'])[1]] || 0;

      for (var i = 0; i < orderNos.length; ++i)
      {
        prepareOrderTemplateData(extraRows, orderMap[orderNos[i]], this.group());
      }
    },
    function sendResponseStep(err, orders)
    {
      if (err)
      {
        return next(err);
      }

      templateData.orders = orders;

      res.render('orders:print', templateData);
    }
  );

  function prepareOrderTemplateData(extraRows, order, done)
  {
    var orderTemplateData = {
      qrCode: null,
      order: null,
      pages: null
    };

    step(
      function prepareTemplateDataStep()
      {
        var operations = (order.operations || []).map(function(operation)
        {
          return {
            no: operation.no,
            workCenter: operation.workCenter || '',
            description: operation.name,
            quantity: formatNumber(operation.qty)[0],
            unit: operation.unit,
            machineSetupTime: formatOperationTime(operation.machineSetupTime),
            machineTime: formatOperationTime(operation.machineTime),
            laborSetupTime: formatOperationTime(operation.laborSetupTime),
            laborTime: formatOperationTime(operation.laborTime)
          };
        });

        var documents = (order.documents || []).map(function(document)
        {
          return {
            no: document.item || '0000',
            material: document.nc15,
            description: document.name
          };
        });

        var components = (order.bom || []).map(function(component)
        {
          var qty = component.qty;

          if (component.nc12)
          {
            qty /= order.qty;
          }

          return {
            no: component.item,
            material: component.nc12,
            description: component.name,
            quantity: formatNumber(qty),
            unit: component.unit,
            unloadingPoint: component.unloadingPoint
          };
        });

        orderTemplateData.pages = buildPages(extraRows, operations, documents, components);
        orderTemplateData.order = {
          no: order._id,
          material: order.nc12,
          materialDescription: order.description || order.name || '',
          mrpController: order.mrp || '',
          quantity: formatNumber(order.qty)[0],
          unit: order.unit,
          priority: order.priority || '',
          startDate: moment(order.scheduledStartDate || order.startDate).format(DATE_FORMAT),
          finishDate: moment(order.scheduledFinishDate || order.finishDate).format(DATE_FORMAT),
          salesOrder: order.salesOrder ? (order.salesOrder + '/' + order.salesOrderItem) : '',
          shipTo: order.soldToParty || '',
          leadingOrder: order.leadingOrder || ''
        };

        setImmediate(this.next());
      },
      function generateBarcodesStep()
      {
        var qrCodeData = format(
          '%s %s %s %s',
          orderTemplateData.order.no,
          orderTemplateData.order.material,
          orderTemplateData.order.quantity,
          orderTemplateData.order.materialDescription
        );

        generateQrCode(ordersModule.config.zintExe, qrCodeData, this.next());
      },
      function assignBarcodesStep(err, qrCode)
      {
        if (err)
        {
          ordersModule.error("Failed to generate barcodes: %s", err.message);
        }

        orderTemplateData.qrCode = qrCode || null;
      },
      function sendResultStep()
      {
        setImmediate(done, null, orderTemplateData);
      }
    );
  }
};

function formatOperationTime(n)
{
  return n ? formatNumber(n).join(',') : '';
}

function formatNumber(n)
{
  if (!n)
  {
    return [0, 0];
  }

  var str = (Math.round(n * 1000) / 1000).toString().split('.');
  var integer = str[0];
  var decimals = str.length === 1 ? '000' : str[1];

  while (decimals.length < 3)
  {
    decimals += '0';
  }

  return [integer, decimals];
}

function buildPages(extraRows, remainingOperations, remainingDocuments, remainingComponents)
{
  var pages = [];

  while (remainingOperations.length || remainingDocuments.length || remainingComponents.length)
  {
    pages.push(buildPage(pages.length + 1, extraRows, remainingOperations, remainingDocuments, remainingComponents));
  }

  for (var p = 1; p < pages.length; ++p)
  {
    var previousPage = pages[p - 1];
    var currentPage = pages[p];

    currentPage.continuation.operations = previousPage.operations.length > 0;
    currentPage.continuation.documents = previousPage.documents.length > 0;
    currentPage.continuation.components = previousPage.components.length > 0;
  }

  return pages;
}

function buildPage(pageNo, extraRows, remainingOperations, remainingDocuments, remainingComponents)
{
  var page = {
    no: pageNo,
    operations: [],
    documents: [],
    components: [],
    continuation: {
      operations: false,
      documents: false,
      components: false
    }
  };
  var pageHeaderHeight   = 0  + 27 + 0;
  var orderSummaryHeight = 10 + 80 + 10;
  var orderExtraHeight   = 4  + 37 + 10;
  var sectionTitleHeight = 20 + 16 + 6;
  var sectionTheadHeight = 0  + 12 + 0;
  var sectionRowHeight   = 6  + 12 + 0;
  var minSectionHeight = sectionTitleHeight + sectionTheadHeight + sectionRowHeight;
  var pageHeight = 960;
  var remainingPageHeight = pageHeight - pageHeaderHeight - orderSummaryHeight + extraRows * sectionRowHeight;

  if (pageNo === 1)
  {
    remainingPageHeight -= orderExtraHeight;
  }

  if (remainingOperations.length)
  {
    remainingPageHeight -= sectionTitleHeight + sectionTheadHeight;

    while (remainingOperations.length && remainingPageHeight >= sectionRowHeight)
    {
      page.operations.push(remainingOperations.shift());

      remainingPageHeight -= sectionRowHeight;
    }
  }

  if (remainingDocuments.length && remainingPageHeight >= minSectionHeight)
  {
    remainingPageHeight -= sectionTitleHeight + sectionTheadHeight;

    while (remainingDocuments.length && remainingPageHeight >= sectionRowHeight)
    {
      page.documents.push(remainingDocuments.shift());

      remainingPageHeight -= sectionRowHeight;
    }
  }

  if (remainingComponents.length && remainingPageHeight >= minSectionHeight)
  {
    remainingPageHeight -= sectionTitleHeight + sectionTheadHeight;

    while (remainingComponents.length && remainingPageHeight >= sectionRowHeight)
    {
      page.components.push(remainingComponents.shift());

      remainingPageHeight -= sectionRowHeight;
    }
  }

  return page;
}

function generateQrCode(zintExe, data, done)
{
  var cmd = format('"%s" --barcode=58 --vers=5 --scale=1 --notext --directpng --data="%s"', zintExe, data);

  exec(cmd, {encoding: 'buffer'}, function(err, stdout)
  {
    if (err)
    {
      return done(err);
    }

    return done(null, stdout.toString('base64'));
  });
}

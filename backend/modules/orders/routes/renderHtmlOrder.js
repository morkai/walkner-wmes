// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const format = require('util').format;
const exec = require('child_process').exec;
const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const resolveProductName = require('../../util/resolveProductName');

module.exports = function renderHtmlOrderRoute(app, ordersModule, req, res, next)
{
  const DATE_FORMAT = 'DD.MM.YYYY';
  const EXTRA_ROWS = {
    Firefox: 1,
    Edge: 1,
    Trident: 1,
    wkhtmltopdf: 19
  };
  const USER_AGENT_RE = new RegExp('(' + _.keys(EXTRA_ROWS).join('|') + ')');

  const express = app[ordersModule.config.expressId];
  const Order = app[ordersModule.config.mongooseId].model('Order');

  const orderNos = req.params.id.split(/[^0-9]/).filter(function(d) { return !!d.length; });

  if (!orderNos.length)
  {
    return next(express.createHttpError('INVALID_ORDER_NO'));
  }

  const templateData = {
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

      const orderMap = {};

      _.forEach(orders, function(order) { orderMap[order._id] = order; });

      const userAgent = req.headers['user-agent'] || '';
      const extraRows = EXTRA_ROWS[(userAgent.match(USER_AGENT_RE) || [null, 'Chrome'])[1]] || 0;

      for (let i = 0; i < orderNos.length; ++i)
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
    const orderTemplateData = {
      qrCode: null,
      order: null,
      pages: null
    };

    step(
      function prepareTemplateDataStep()
      {
        const operations = (order.operations || []).map(function(operation)
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

        const documents = (order.documents || []).map(function(document)
        {
          return {
            no: document.item || '0000',
            material: document.nc15,
            description: document.name
          };
        });

        const components = (order.bom || []).map(function(component)
        {
          let qty = component.qty;

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
          materialDescription: resolveProductName(order),
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
        const qrCodeData = format(
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
          ordersModule.error('Failed to generate barcodes: %s', err.message);
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

  const str = (Math.round(n * 1000) / 1000).toString().split('.');
  const integer = str[0];
  let decimals = str.length === 1 ? '000' : str[1];

  while (decimals.length < 3)
  {
    decimals += '0';
  }

  return [integer, decimals];
}

function buildPages(extraRows, remainingOperations, remainingDocuments, remainingComponents)
{
  const pages = [];

  while (remainingOperations.length || remainingDocuments.length || remainingComponents.length)
  {
    pages.push(buildPage(pages.length + 1, extraRows, remainingOperations, remainingDocuments, remainingComponents));
  }

  for (let p = 1; p < pages.length; ++p)
  {
    const previousPage = pages[p - 1];
    const currentPage = pages[p];

    currentPage.continuation.operations = previousPage.operations.length > 0;
    currentPage.continuation.documents = previousPage.documents.length > 0;
    currentPage.continuation.components = previousPage.components.length > 0;
  }

  return pages;
}

function buildPage(pageNo, extraRows, remainingOperations, remainingDocuments, remainingComponents)
{
  const page = {
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
  const pageHeaderHeight = 0 + 27 + 0;
  const orderSummaryHeight = 10 + 80 + 10;
  const orderExtraHeight = 4 + 37 + 10;
  const sectionTitleHeight = 20 + 16 + 6;
  const sectionTheadHeight = 0 + 12 + 0;
  const sectionRowHeight = 6 + 12 + 0;
  const minSectionHeight = sectionTitleHeight + sectionTheadHeight + sectionRowHeight;
  const pageHeight = 960;
  let remainingPageHeight = pageHeight - pageHeaderHeight - orderSummaryHeight + extraRows * sectionRowHeight;

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
  const cmd = format('"%s" --barcode=58 --vers=5 --scale=1 --notext --directpng --data="%s"', zintExe, data);

  exec(cmd, {encoding: 'buffer'}, function(err, stdout)
  {
    if (err)
    {
      return done(err);
    }

    return done(null, stdout.toString('base64'));
  });
}

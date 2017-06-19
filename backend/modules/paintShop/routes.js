// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const multer = require('multer');
const moment = require('moment');

module.exports = function setUpPaintShopRoutes(app, module)
{
  const fteModule = app[module.config.fteId];
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PaintShopOrder = mongoose.model('PaintShopOrder');

  const canView = userModule.auth('LOCAL', 'PAINT_SHOP:VIEW');
  const canManage = userModule.auth('LOCAL', 'PAINT_SHOP:MANAGE');

  express.post(
    '/paintShop/orders;import',
    canManage,
    multer({
      storage: multer.diskStorage({}),
      fileFilter: function(req, file, done)
      {
        done(null, /vnd\.ms-excel\.sheet|spreadsheetml\.sheet/.test(file.mimetype)
          && /\.xls[xm]$/.test(file.originalname));
      }
    }).single('queue'),
    importOrdersQueue
  );

  express.get(
    '/paintShop/orders',
    canView,
    prepareCurrentDate,
    express.crud.browseRoute.bind(null, app, PaintShopOrder)
  );

  express.get('/paintShop/orders/:id', canView, express.crud.readRoute.bind(null, app, PaintShopOrder));

  function prepareCurrentDate(req, res, next)
  {
    req.rql.selector.args.forEach(function(term)
    {
      if (term.name !== 'eq' || term.args[0] !== 'date')
      {
        return;
      }

      const date = term.args[1];

      if (date === 'current')
      {
        term.args[1] = new Date(fteModule.currentShift.date.getTime());
      }
      else if (/^[0-9]+-[0-9]+-[0-9]+$/.test(date))
      {
        term.args[1] = moment.utc(date, 'YYYY-MM-DD').toDate();
      }
    });

    next();
  }

  function importOrdersQueue(req, res, next)
  {
    if (!req.file)
    {
      return next(app.createError('INVALID_FILE', 400));
    }

    const filePath = req.file.path;
    const date = req.body.date || req.file.originalname;
    const user = req.session.user || null;

    module.importQueueFile(filePath, date, user, function(err, result)
    {
      fs.unlink(req.file.path, () => {});

      if (err)
      {
        return next(err);
      }

      res.json(result);
    });
  }
};

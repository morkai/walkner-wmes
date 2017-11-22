// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');

module.exports = function setUpPaintShopRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PaintShopEvent = mongoose.model('PaintShopEvent');
  const PaintShopOrder = mongoose.model('PaintShopOrder');
  const PaintShopDropZone = mongoose.model('PaintShopDropZone');

  const canView = userModule.auth('LOCAL', 'PAINT_SHOP:VIEW', 'PLANNING:VIEW');
  const canUpdate = userModule.auth('LOCAL', 'PAINT_SHOP:PAINTER', 'PAINT_SHOP:MANAGE');
  const canManage = userModule.auth('PAINT_SHOP:MANAGE');
  const canManageDropZones = userModule.auth('PAINT_SHOP:DROP_ZONES');

  express.post('/paintShop/:id;generate', canManage, generateRoute);

  express.get(
    '/paintShop/events',
    canView,
    express.crud.browseRoute.bind(null, app, PaintShopEvent)
  );

  express.get(
    '/paintShop/orders',
    canView,
    prepareCurrentDate,
    express.crud.browseRoute.bind(null, app, PaintShopOrder)
  );

  express.get('/paintShop/orders/:id', canView, express.crud.readRoute.bind(null, app, PaintShopOrder));

  express.patch('/paintShop/orders/:id', canUpdate, updatePaintShopOrderRoute);

  express.get(
    '/paintShop/dropZones',
    canView,
    express.crud.browseRoute.bind(null, app, PaintShopDropZone)
  );

  express.post('/paintShop/dropZones/:date/:mrp', canManageDropZones, updateDropZoneRoute);

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
        const m = moment();

        if (m.hours() < 17)
        {
          m.startOf('day').subtract(1, 'days');
        }
        else
        {
          m.startOf('day').add(1, 'days');
        }

        term.args[1] = moment.utc(m.format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate();
      }
      else if (/^[0-9]+-[0-9]+-[0-9]+$/.test(date))
      {
        term.args[1] = moment.utc(date, 'YYYY-MM-DD').toDate();
      }
    });

    next();
  }

  function updatePaintShopOrderRoute(req, res, next)
  {
    const {action, comment, qtyDone} = req.body;

    step(
      function()
      {
        PaintShopOrder.findById(req.params.id).exec(this.next());
      },
      function(err, psOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!psOrder)
        {
          return this.skip(app.createError('NOT_FOUND', 404));
        }

        psOrder.act(action, comment, qtyDone, this.next());
      },
      function(err, changes)
      {
        if (err)
        {
          return next(err);
        }

        res.json(changes);

        app.broker.publish(`paintShop.orders.updated.${req.params.id}`, changes);

        PaintShopEvent.record({
          type: action,
          time: new Date(),
          user: userModule.createUserInfo(req.session.user, req),
          order: req.params.id,
          data: _.pick(changes, ['comment', 'qtyDone'])
        });
      }
    );
  }

  function generateRoute(req, res)
  {
    app.broker.publish('paintShop.generator.requested', {
      date: req.params.id
    });

    res.sendStatus(203);
  }

  function updateDropZoneRoute(req, res, next)
  {
    const {date, mrp} = req.params;

    if (!_.isString(date) || !moment(date, 'YYYY-MM-DD').isValid() || !_.isString(mrp) || _.isEmpty(mrp))
    {
      return next(app.createError('INPUT', 400));
    }

    const state = !!req.body.state;

    PaintShopDropZone.collection.update({_id: {date, mrp}}, {$set: {state}}, {upsert: true}, (err) =>
    {
      if (err)
      {
        return next(err);
      }

      const dropZone = {
        _id: {date, mrp},
        state
      };

      res.json(dropZone);

      app.broker.publish(`paintShop.dropZones.updated.${date}`, dropZone);
    });
  }
};

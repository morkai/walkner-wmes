// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const _ = require('lodash');
const step = require('h5.step');
const mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = function setUpPressWorksheetsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PressWorksheet = mongoose.model('PressWorksheet');
  const LossReason = mongoose.model('LossReason');
  const DowntimeReason = mongoose.model('DowntimeReason');

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PRESS_WORKSHEETS:VIEW');
  const canManage = userModule.auth('PRESS_WORKSHEETS:MANAGE', 'PROD_DATA:MANAGE');

  express.get(
    '/pressWorksheets', canView, limitToMine, express.crud.browseRoute.bind(null, app, PressWorksheet)
  );

  express.get('/pressWorksheets;export.:format?', canView, prepareExport, express.crud.exportRoute.bind(null, app, {
    filename: 'WORKSHEETS',
    freezeRows: 1,
    freezeColumns: 1,
    columns: {
      rid: 7,
      date: 'date',
      shift: {
        type: 'integer',
        width: 4
      },
      type: 10,
      shiftLeader: 20,
      leader: 20,
      no: {
        type: 'integer',
        width: 3
      },
      nc12: 12,
      name: 40,
      operationName: 40,
      operationNo: 4,
      division: 5,
      machine: 15,
      quantityDone: {
        type: 'integer',
        width: 6
      },
      startedAt: 8,
      finishedAt: 8,
      mmh: {
        type: 'decimal',
        width: 7
      },
      notes: 40
    },
    prepareColumn: (column, req) =>
    {
      if (column.caption.startsWith('loss.'))
      {
        const id = column.caption.replace('loss.', '');

        if (req.lossReasons[id])
        {
          column.caption = `${id}: ${req.lossReasons[id]}`;
        }

        column.type = 'integer';
        column.width = 5;
      }
      else if (column.caption.startsWith('downtime.'))
      {
        const id = column.caption.replace('downtime.', '');

        if (req.downtimeReasons[id])
        {
          column.caption = `${id}: ${req.downtimeReasons[id]}`;
        }

        column.type = 'integer';
        column.width = 5;
      }
    },
    serializeStream: exportEntries,
    cleanUp: cleanUpExport,
    model: PressWorksheet
  }));

  express.get('/pressWorksheets;rid', canView, findByRidRoute);

  express.post(
    '/pressWorksheets',
    canManage,
    prepareDataForAdd,
    express.crud.addRoute.bind(null, app, PressWorksheet)
  );

  express.get('/pressWorksheets/:id', canView, express.crud.readRoute.bind(null, app, PressWorksheet));

  express.put(
    '/pressWorksheets/:id',
    canManage,
    prepareDataForEdit,
    express.crud.editRoute.bind(null, app, PressWorksheet)
  );

  express.delete(
    '/pressWorksheets/:id', canManage, express.crud.deleteRoute.bind(null, app, PressWorksheet)
  );

  function findByRidRoute(req, res, next)
  {
    const rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    PressWorksheet.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, pressWorksheet)
    {
      if (err)
      {
        return next(err);
      }

      if (pressWorksheet)
      {
        return res.json(pressWorksheet._id);
      }

      return res.sendStatus(404);
    });
  }

  function prepareDataForAdd(req, res, next)
  {
    const date = new Date(req.body.date + ' 00:00:00');

    if (req.body.shift === 1)
    {
      date.setHours(6);
    }
    else if (req.body.shift === 2)
    {
      date.setHours(14);
    }
    else
    {
      date.setHours(22);
    }

    req.body.date = date;
    req.body.createdAt = new Date();
    req.body.creator = userModule.createUserInfo(req.session.user, req);

    return next();
  }

  function prepareDataForEdit(req, res, next)
  {
    const date = new Date(req.body.date + ' 00:00:00');

    if (req.body.shift === 1)
    {
      date.setHours(6);
    }
    else if (req.body.shift === 2)
    {
      date.setHours(14);
    }
    else
    {
      date.setHours(22);
    }

    req.body.date = date;
    req.body.updatedAt = new Date();
    req.body.updater = userModule.createUserInfo(req.session.user, req);

    PressWorksheet.findById(req.params.id, function(err, pressWorksheet)
    {
      if (err)
      {
        return next(err);
      }

      req.model = pressWorksheet;

      return next();
    });
  }

  function limitToMine(req, res, next)
  {
    const selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    const mineTerm = _.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'mine';
    });

    if (mineTerm)
    {
      mineTerm.args = ['creator.id', new ObjectId(req.session.user._id)];
    }

    return next();
  }

  function prepareExport(req, res, next)
  {
    req.rql.fields = {};

    step(
      function()
      {
        PressWorksheet
          .countDocuments(mongoSerializer.fromQuery(req.rql))
          .exec(this.parallel());

        LossReason
          .find({}, {label: 1})
          .lean()
          .exec(this.parallel());

        DowntimeReason
          .find({subdivisionTypes: {$in: ['press', 'paintShop']}}, {label: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, exportCount, lossReasons, downtimeReasons)
      {
        if (err)
        {
          return this.skip(err);
        }

        req.exportCount = exportCount;
        req.lossReasons = {};
        req.downtimeReasons = {};

        lossReasons.forEach(d => req.lossReasons[d._id] = d.label);
        downtimeReasons.forEach(d => req.downtimeReasons[d._id] = d.label);
      },
      next
    );
  }

  function cleanUpExport(req)
  {
    req.lossReasons = null;
    req.downtimeReasons = null;
  }

  function exportEntries(cursor, emitter, req)
  {
    const docs = [];
    const dictionaries = {
      lossReasons: new Set(),
      downtimeReasons: new Set()
    };

    if (req.exportCount > 100)
    {
      Object.keys(req.lossReasons).forEach(id => dictionaries.lossReasons.add(id));
      Object.keys(req.downtimeReasons).forEach(id => dictionaries.downtimeReasons.add(id));
    }

    cursor.on('error', err => emitter.emit('error', err));

    cursor.on('end', () =>
    {
      if (docs.length)
      {
        return exportNextEntry(emitter, dictionaries, docs);
      }

      emitter.emit('end');
    });

    cursor.on('data', doc =>
    {
      if (req.exportCount > 100)
      {
        doc.orders.forEach((order, i) => emitter.emit('data', exportOrder(doc, order, i + 1, dictionaries)));
      }
      else
      {
        doc.orders.forEach(order =>
        {
          const losses = {};
          const downtimes = {};

          order.losses.forEach(loss =>
          {
            dictionaries.lossReasons.add(loss.reason);

            losses[loss.reason] = loss.count;
          });

          order.downtimes.forEach(downtime =>
          {
            dictionaries.downtimeReasons.add(downtime.reason);

            downtimes[downtime.reason] = downtime.duration;
          });

          order.losses = losses;
          order.downtimes = downtimes;
        });

        docs.push(doc);
      }
    });
  }

  function exportNextEntry(emitter, dictionaries, docs)
  {
    for (let i = 0; i < 5; ++i)
    {
      const doc = docs.shift();

      if (!doc)
      {
        return emitter.emit('end');
      }

      doc.orders.forEach((order, i) => emitter.emit('data', exportOrder(doc, order, i + 1, dictionaries)));
    }

    setImmediate(exportNextEntry, emitter, dictionaries, docs);
  }

  function exportOrder(doc, order, no, dictionaries)
  {
    const row = {
      rid: doc.rid,
      date: doc.date,
      shift: doc.shift,
      type: doc.type,
      shiftLeader: doc.master ? doc.master.label : '',
      operator: doc.operator ? doc.operator.label : '',
      no,
      nc12: order.nc12,
      name: order.name,
      operationName: order.operationName,
      operationNo: order.operationNo,
      division: order.division,
      machine: order.prodLine,
      quantityDone: order.quantityDone,
      startedAt: order.startedAt.length === 5 ? `${order.startedAt}:00` : app.formatTime(order.startedAt),
      finishedAt: order.finishedAt.length === 5 ? `${order.finishedAt}:00` : app.formatTime(order.finishedAt),
      mmh: 0,
      notes: order.notes
    };

    const operation = order.orderData.operations[order.operationNo];

    if (operation)
    {
      row.mmh = operation.machineTime / 100 * order.quantityDone;
    }

    dictionaries.lossReasons.forEach(id =>
    {
      row[`loss.${id}`] = order.losses[id] || 0;
    });

    dictionaries.downtimeReasons.forEach(id =>
    {
      row[`downtime.${id}`] = order.downtimes[id] || 0;
    });

    return row;
  }
};

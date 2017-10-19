// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const multer = require('multer');
const moment = require('moment');
const canManage = require('./canManage');

module.exports = function setUpHourlyPlansRoutes(app, hourlyPlansModule)
{
  const express = app[hourlyPlansModule.config.expressId];
  const auth = app[hourlyPlansModule.config.userId].auth;
  const mongoose = app[hourlyPlansModule.config.mongooseId];
  const settings = app[hourlyPlansModule.config.settingsId];
  const HourlyPlan = mongoose.model('HourlyPlan');
  const DailyMrpPlan = mongoose.model('DailyMrpPlan');

  const canView = auth('HOURLY_PLANS:VIEW', 'PLANNING:MANAGE', 'PLANNING:PLANNER');
  const canManageDailyMrpPlans = auth('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');

  express.get(
    '/hourlyPlans/settings',
    canView,
    function limitSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^(planning|production)\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/hourlyPlans/settings/:id', auth('PROD_DATA:MANAGE'), settings.updateRoute);

  //
  // Hourly plans
  //
  express.get('/hourlyPlans', canView, express.crud.browseRoute.bind(null, app, HourlyPlan));

  express.get(
    '/hourlyPlans;export.:format?',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-HOURLY_PLANS',
      freezeRows: 1,
      columns: {
        division: 8,
        date: 'date',
        shift: {
          type: 'integer',
          width: 5
        },
        prodFlow: 30,
        level: {
          type: 'integer',
          width: 5
        }
      },
      serializeRow: exportHourlyPlan,
      model: HourlyPlan
    })
  );

  express.get('/hourlyPlans/:id', canView, express.crud.readRoute.bind(null, app, HourlyPlan));

  express.delete('/hourlyPlans/:id', canDelete, express.crud.deleteRoute.bind(null, app, HourlyPlan));

  //
  // Daily MRP plans
  //
  express.get('/dailyMrpPlans', canView, fixDailyMrpPlanDate, express.crud.browseRoute.bind(null, app, DailyMrpPlan));

  express.get('/dailyMrpPlans/:id', canView, express.crud.readRoute.bind(null, app, DailyMrpPlan));

  express.post(
    '/dailyMrpPlans;parse',
    canManageDailyMrpPlans,
    multer({
      storage: multer.diskStorage({}),
      fileFilter: function(req, file, done)
      {
        done(null, /vnd.ms-excel.sheet|spreadsheetml.sheet/.test(file.mimetype)
          && /\.xls(x|m)$/.test(file.originalname));
      }
    }).single('plan'),
    parseDailyMrpPlan
  );

  express.post('/dailyMrpPlans;import', canManageDailyMrpPlans, importDailyMrpPlans);

  express.post('/dailyMrpPlans;update', canManageDailyMrpPlans, updateDailyMrpPlans);

  function canDelete(req, res, next)
  {
    HourlyPlan.findById(req.params.id).exec(function(err, hourlyPlan)
    {
      if (err)
      {
        return next(err);
      }

      req.model = hourlyPlan;

      if (hourlyPlan && !canManage(req.session.user, hourlyPlan))
      {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  function exportHourlyPlan(doc)
  {
    const rows = [];

    _.forEach(doc.flows, function(flow)
    {
      if (flow.noPlan)
      {
        return;
      }

      rows.push({
        division: doc.division,
        date: doc.date,
        shift: doc.shift,
        prodFlow: flow.name,
        level: flow.level,
        '#h06': flow.hours[0],
        '#h07': flow.hours[1],
        '#h08': flow.hours[2],
        '#h09': flow.hours[3],
        '#h10': flow.hours[4],
        '#h11': flow.hours[5],
        '#h12': flow.hours[6],
        '#h13': flow.hours[7],
        '#h14': flow.hours[8],
        '#h15': flow.hours[9],
        '#h16': flow.hours[10],
        '#h17': flow.hours[11],
        '#h18': flow.hours[12],
        '#h19': flow.hours[13],
        '#h20': flow.hours[14],
        '#h21': flow.hours[15],
        '#h22': flow.hours[16],
        '#h23': flow.hours[17],
        '#h00': flow.hours[18],
        '#h01': flow.hours[19],
        '#h02': flow.hours[20],
        '#h03': flow.hours[21],
        '#h04': flow.hours[22],
        '#h05': flow.hours[23],
        planId: doc._id
      });
    });

    return rows;
  }

  function fixDailyMrpPlanDate(req, res, next)
  {
    _.forEach(req.rql.selector.args, function(term)
    {
      if (term.args[0] === 'date' && typeof term.args[1] === 'string')
      {
        const dateMoment = moment(term.args[1], 'YYYY-MM-DD');

        if (dateMoment.isValid())
        {
          term.args[1] = dateMoment.valueOf();
        }
      }
    });

    next();
  }

  function parseDailyMrpPlan(req, res, next)
  {
    if (!req.file)
    {
      return next(app.createError('INVALID_FILE', 400));
    }

    hourlyPlansModule.dailyMrpPlans.parse(req.file.path, function(err, json)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.end(json);
    });
  }

  function importDailyMrpPlans(req, res, next)
  {
    const b = req.body;

    hourlyPlansModule.dailyMrpPlans.import(b.dailyMrpPlans, b.instanceId, function(err, importedPlans)
    {
      if (err)
      {
        return next(err);
      }

      res.json(importedPlans);
    });
  }

  function updateDailyMrpPlans(req, res, next)
  {
    const b = req.body;

    hourlyPlansModule.dailyMrpPlans.update(b.action, b.planId, b.data, b.instanceId, function(err, updatedAt)
    {
      if (err)
      {
        return next(err);
      }

      res.json(updatedAt);
    });
  }
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const canManage = require('./canManage');

module.exports = function setUpHourlyPlansRoutes(app, module)
{
  const express = app[module.config.expressId];
  const auth = app[module.config.userId].auth;
  const mongoose = app[module.config.mongooseId];
  const settings = app[module.config.settingsId];
  const HourlyPlan = mongoose.model('HourlyPlan');

  const canView = auth('HOURLY_PLANS:VIEW', 'PLANNING:MANAGE', 'PLANNING:PLANNER');

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

  express.post('/planning/plans/:date;hourlyPlan', auth('PLANNING:MANAGE'), updateFromDailyPlanRoute);

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

  function updateFromDailyPlanRoute(req, res, next)
  {
    const dateMoment = moment.utc(req.params.date, 'YYYY-MM-DD');

    if (!dateMoment.isValid())
    {
      return next(app.createError('INPUT', 400));
    }

    module.updateFromDailyPlan(dateMoment.toDate(), [], err =>
    {
      if (err)
      {
        return next(err);
      }

      res.json({date: dateMoment.toISOString()});
    });
  }
};

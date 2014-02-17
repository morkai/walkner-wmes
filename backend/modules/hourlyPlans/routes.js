'use strict';

var moment = require('moment');
var crud = require('../express/crud');

module.exports = function setUpHourlyPlansRoutes(app, hourlyPlansModule)
{
  var express = app[hourlyPlansModule.config.expressId];
  var auth = app[hourlyPlansModule.config.userId].auth;
  var mongoose = app[hourlyPlansModule.config.mongooseId];
  var HourlyPlan = mongoose.model('HourlyPlan');

  var canView = auth('HOURLY_PLANS:VIEW');

  express.get('/hourlyPlans', canView, crud.browseRoute.bind(null, app, HourlyPlan));

  express.get(
    '/hourlyPlans;export',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {};

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-HOURLY_PLANS',
      serializeRow: exportHourlyPlan,
      model: HourlyPlan
    })
  );

  express.get('/hourlyPlans/:id', canView, crud.readRoute.bind(null, app, HourlyPlan));

  function exportHourlyPlan(doc)
  {
    var rows = [];
    var date = moment(doc.date).format('YYYY-MM-DD');

    doc.flows.forEach(function(flow)
    {
      rows.push({
        '"division': doc.division,
        'date': date,
        'shiftNo': doc.shift,
        '"prodFlow': flow.name,
        'noPlan': flow.noPlan ? 1 : 0,
        '#level': flow.level,
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
        '"planId': doc._id
      });
    });

    return rows;
  }
};

'use strict';

var moment = require('moment');
var crud = require('../express/crud');
var limitOrgUnit = require('../prodLines/limitOrgUnit');

module.exports = function setUpProdShiftsRoutes(app, prodShiftsModule)
{
  var express = app[prodShiftsModule.config.expressId];
  var userModule = app[prodShiftsModule.config.userId];
  var mongoose = app[prodShiftsModule.config.mongooseId];
  var subdivisionsModule = app[prodShiftsModule.config.subdivisionsId];
  var prodFlowsModule = app[prodShiftsModule.config.prodFlowsId];
  var ProdShift = mongoose.model('ProdShift');

  var canView = userModule.auth('PROD_DATA:VIEW');

  express.get('/prodShifts', canView, limitOrgUnit, crud.browseRoute.bind(null, app, ProdShift));

  express.get(
    '/prodShifts;export',
    canView,
    limitOrgUnit,
    function(req, res, next)
    {
      req.rql.fields = {
        creator: 0,
        createdAt: 0
      };

      next();
    },
    crud.exportRoute.bind(null, {
      filename: 'WMES-SHIFTS',
      serializeRow: exportProdShift,
      model: ProdShift
    })
  );

  express.get('/prodShifts/:id', canView, crud.readRoute.bind(null, app, ProdShift));

  function exportProdShift(doc)
  {
    var subdivision = subdivisionsModule.modelsById[doc.subdivision];
    var prodFlow = prodFlowsModule.modelsById[doc.prodFlow];

    return {
      'date': moment(doc.date).format('YYYY-MM-DD'),
      'shiftNo': doc.shift,
      'h1': doc.quantitiesDone[0].actual,
      'h2': doc.quantitiesDone[1].actual,
      'h3': doc.quantitiesDone[2].actual,
      'h4': doc.quantitiesDone[3].actual,
      'h5': doc.quantitiesDone[4].actual,
      'h6': doc.quantitiesDone[5].actual,
      'h7': doc.quantitiesDone[6].actual,
      'h8': doc.quantitiesDone[7].actual,
      '"master': doc.master ? doc.master.label : '',
      '"leader': doc.leader ? doc.leader.label : '',
      '"operator': doc.operator ? doc.operator.label : '',
      '"division': doc.division,
      '"subdivision': subdivision ? subdivision.name : doc.subdivision,
      '"mrp': doc.mrpControllers.join(','),
      '"prodFlow': prodFlow ? prodFlow.name : doc.prodFlow,
      '"workCenter': doc.workCenter,
      '"prodLine': doc.prodLine,
      '"shiftId': doc._id
    };
  }
};

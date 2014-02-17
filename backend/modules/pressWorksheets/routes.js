'use strict';

var crud = require('../express/crud');
var userInfo = require('../../models/userInfo');

module.exports = function setUpPressWorksheetsRoutes(app, pressWorksheetsModule)
{
  var express = app[pressWorksheetsModule.config.expressId];
  var user = app[pressWorksheetsModule.config.userId];
  var PressWorksheet = app[pressWorksheetsModule.config.mongooseId].model('PressWorksheet');

  var canView = user.auth('PRESS_WORKSHEETS:VIEW');
  var canManage = user.auth('PRESS_WORKSHEETS:MANAGE');

  express.get('/pressWorksheets', canView, crud.browseRoute.bind(null, app, PressWorksheet));

  express.post(
    '/pressWorksheets', canManage, prepareData, crud.addRoute.bind(null, app, PressWorksheet)
  );

  express.get('/pressWorksheets/:id', canView, crud.readRoute.bind(null, app, PressWorksheet));

  express.del('/pressWorksheets/:id', canManage, crud.deleteRoute.bind(null, app, PressWorksheet));

  function prepareData(req, res, next)
  {
    var date = new Date(req.body.date + ' 00:00:00');

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
    req.body.creator = userInfo.createObject(req.session.user, req);

    return next();
  }
};

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

  express.get('/pressWorksheets;rid', canView, findByRidRoute);

  express.post(
    '/pressWorksheets',
    canManage,
    prepareDataForAdd,
    crud.addRoute.bind(null, app, PressWorksheet)
  );

  express.get('/pressWorksheets/:id', canView, crud.readRoute.bind(null, app, PressWorksheet));

  express.put(
    '/pressWorksheets/:id',
    canManage,
    prepareDataForEdit,
    crud.editRoute.bind(null, app, PressWorksheet)
  );

  express.del('/pressWorksheets/:id', canManage, crud.deleteRoute.bind(null, app, PressWorksheet));

  function findByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.send(400);
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

      return res.send(404);
    });
  }

  function prepareDataForAdd(req, res, next)
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

  function prepareDataForEdit(req, res, next)
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
    req.body.updatedAt = new Date();
    req.body.updater = userInfo.createObject(req.session.user, req);

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
};

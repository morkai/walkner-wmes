// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('lodash');

module.exports = function setUpPressWorksheetsRoutes(app, pressWorksheetsModule)
{
  var express = app[pressWorksheetsModule.config.expressId];
  var userModule = app[pressWorksheetsModule.config.userId];
  var PressWorksheet = app[pressWorksheetsModule.config.mongooseId].model('PressWorksheet');

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PRESS_WORKSHEETS:VIEW');
  var canManage = userModule.auth('PRESS_WORKSHEETS:MANAGE', 'PROD_DATA:MANAGE');

  express.get(
    '/pressWorksheets', canView, limitToMine, express.crud.browseRoute.bind(null, app, PressWorksheet)
  );

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
    var rid = parseInt(req.query.rid, 10);

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
    req.body.creator = userModule.createUserInfo(req.session.user, req);

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
    var selector = req.rql.selector;

    if (!Array.isArray(selector.args) || !selector.args.length)
    {
      return next();
    }

    var mineTerm = _.find(selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'mine';
    });

    if (mineTerm)
    {
      mineTerm.args = ['creator.id', new ObjectId(req.session.user._id)];
    }

    return next();
  }
};

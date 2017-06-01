// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpMinutesForSafetyCardsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const MinutesForSafetyCard = mongoose.model('MinutesForSafetyCard');

  const canView = userModule.auth();
  const canManage = userModule.auth();

  express.get(
    '/minutesForSafetyCards',
    canView,
    prepareForBrowse,
    express.crud.browseRoute.bind(null, app, MinutesForSafetyCard)
  );

  express.get('/minutesForSafetyCards;rid', canView, findByRidRoute);

  express.post(
    '/minutesForSafetyCards',
    canManage,
    prepareForAdd,
    express.crud.addRoute.bind(null, app, MinutesForSafetyCard)
  );

  express.get(
    '/minutesForSafetyCards/:id',
    canView,
    express.crud.readRoute.bind(null, app, MinutesForSafetyCard)
  );

  express.put(
    '/minutesForSafetyCards/:id',
    canManage,
    prepareForEdit,
    express.crud.editRoute.bind(null, app, MinutesForSafetyCard)
  );

  express.delete(
    '/minutesForSafetyCards/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, MinutesForSafetyCard)
  );

  function prepareForBrowse(req, res, next)
  {
    if (!req.session || !req.session.user)
    {
      return next();
    }

    req.rql.selector.args.forEach(function(term)
    {
      if (term.name === 'eq' && term.args[0] === 'users' && term.args[1] === 'mine')
      {
        term.args[1] = req.session.user._id;
      }
    });

    next();
  }

  function prepareForAdd(req, res, next)
  {
    const body = req.body;

    body.createdAt = new Date();
    body.creator = userModule.createUserInfo(req.session.user, req);
    body.creator.id = body.creator.id.toString();

    return next();
  }

  function prepareForEdit(req, res, next)
  {
    const body = req.body;

    body.updatedAt = new Date();
    body.updater = userModule.createUserInfo(req.session.user, req);
    body.updater.id = body.updater.id.toString();

    return next();
  }

  function findByRidRoute(req, res, next)
  {
    const rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    MinutesForSafetyCard.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, doc)
    {
      if (err)
      {
        return next(err);
      }

      if (doc)
      {
        return res.json(doc._id);
      }

      return res.sendStatus(404);
    });
  }
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpBehaviorObsCardsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const BehaviorObsCard = mongoose.model('BehaviorObsCard');

  var canView = userModule.auth('LOCAL', 'USER');
  var canManage = userModule.auth('USER');

  express.get(
    '/behaviorObsCards', canView, prepareForBrowse, express.crud.browseRoute.bind(null, app, BehaviorObsCard)
  );
  express.get('/behaviorObsCards;rid', canView, findByRidRoute);
  express.post(
    '/behaviorObsCards', canManage, prepareForAdd, express.crud.addRoute.bind(null, app, BehaviorObsCard)
  );
  express.get('/behaviorObsCards/:id', canView, express.crud.readRoute.bind(null, app, BehaviorObsCard));
  express.put(
    '/behaviorObsCards/:id', canManage, prepareForEdit, express.crud.editRoute.bind(null, app, BehaviorObsCard)
  );
  express.delete('/behaviorObsCards/:id', canManage, express.crud.deleteRoute.bind(null, app, BehaviorObsCard));

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

    BehaviorObsCard.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, doc)
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

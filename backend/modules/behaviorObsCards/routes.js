// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

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

  express.get(
    '/behaviorObsCards;export',
    canView,
    prepareForBrowse,
    express.crud.exportRoute.bind(null, {
      filename: 'WMES-BEHAVIOR_OBS',
      serializeRow: exportBehaviorObsCard,
      model: BehaviorObsCard
    })
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

  function exportBehaviorObsCard(doc)
  {
    var rows = [];
    var date = app.formatDate(doc.date);

    _.forEach(doc.observations, function(o)
    {
      rows.push({
        '#rid': doc.rid,
        'date': date,
        '"observer': doc.observer.label,
        '"section': doc.section,
        '"line': doc.line,
        '"position': doc.position,
        '"kind': 'observation',
        '"option1': o.safe ? '' : o.easy ? 'easy' : 'hard',
        '"option2': o.safe ? 'safe' : 'risky',
        '"text1': o.safe ? '' : o.observation,
        '"text2': o.safe ? '' : o.cause,
        '"category': o.behavior
      });
    });

    _.forEach(doc.risks, function(o)
    {
      rows.push({
        '#rid': doc.rid,
        'date': date,
        '"observer': doc.observer.label,
        '"section': doc.section,
        '"line': doc.line,
        '"position': doc.position,
        '"kind': 'risk',
        '"option1': o.easy ? 'easy' : 'hard',
        '"option2': '',
        '"text1': o.risk,
        '"text2': o.cause,
        '"category': ''
      });
    });

    _.forEach(doc.difficulties, function(o)
    {
      rows.push({
        '#rid': doc.rid,
        'date': date,
        '"observer': doc.observer.label,
        '"section': doc.section,
        '"line': doc.line,
        '"position': doc.position,
        '"kind': 'difficulty',
        '"option1': o.behavior ? 'behavior' : 'workConditions',
        '"option2': '',
        '"text1': o.problem,
        '"text2': o.solution,
        '"category': ''
      });
    });

    return rows;
  }
};

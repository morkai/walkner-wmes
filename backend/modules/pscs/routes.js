// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpPscsRoutes(app, pscsModule)
{
  const express = app[pscsModule.config.expressId];
  const userModule = app[pscsModule.config.userId];
  const mongoose = app[pscsModule.config.mongooseId];
  const User = mongoose.model('User');
  const PscsResult = mongoose.model('PscsResult');

  const canView = userModule.auth('PSCS:VIEW');
  const canManage = userModule.auth('PSCS:MANAGE');

  express.get('/pscs', (req, res) => res.redirect('/#pscs'));

  express.get('/pscs/results', canView, express.crud.browseRoute.bind(null, app, PscsResult));

  express.post('/pscs/results', prepareForAdd, express.crud.addRoute.bind(null, app, PscsResult));

  express.get('/pscs/results/:id', canView, express.crud.readRoute.bind(null, app, PscsResult));

  express.put('/pscs/results/:id', prepareForEdit, express.crud.editRoute.bind(null, app, PscsResult));

  express.delete('/pscs/results/:id', canManage, express.crud.deleteRoute.bind(null, app, PscsResult));

  express.get(
    '/pscs/results;export.:format?',
    canView,
    function(req, res, next)
    {
      req.rql.fields = {};
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-PSCS',
      freezeRows: 1,
      freezeColumns: 1,
      columns: {
        rid: 10,
        status: 10,
        personnelId: 10,
        startedAt: 'datetime',
        finishedAt: 'datetime',
        duration: 'integer'
      },
      serializeRow: exportPscsResult,
      model: PscsResult
    })
  );

  function prepareForAdd(req, res, next)
  {
    const personnelId = req.body.personnelId;

    step(
      function()
      {
        User
          .findOne({personellId: personnelId})
          .lean()
          .exec(this.parallel());

        PscsResult
          .findOne({personnelId: personnelId, status: 'passed'})
          .lean()
          .exec(this.parallel());

        PscsResult
          .findOne({personnelId: personnelId, status: 'incomplete'})
          .sort({startedAt: -1})
          .lean()
          .exec(this.parallel());
      },
      function(err, user, passedResult, incompleteResult)
      {
        if (err)
        {
          return next(err);
        }

        if (!user)
        {
          return next(app.createError('USER_NOT_FOUND', 400));
        }

        if (passedResult)
        {
          return next(app.createError('ALREADY_PASSED', 400));
        }

        if (incompleteResult)
        {
          return res.json(incompleteResult);
        }

        const answers = (Array.isArray(req.body.answers) ? req.body.answers : []).map(() => -1);

        req.body = {
          startedAt: new Date(),
          creator: userModule.createUserInfo(req.session.user, req),
          personnelId: personnelId,
          user: userModule.createUserInfo(user, {}),
          answers: answers,
          validity: answers.map(() => false)
        };

        req.body.user.gender = user.gender;

        next();
      }
    );
  }

  function prepareForEdit(req, res, next)
  {
    req.body = _.pick(req.body, ['answers', 'validity']);

    next();
  }

  function exportPscsResult(doc)
  {
    const obj = {
      rid: doc.rid,
      status: doc.status,
      personnelId: doc.personnelId,
      user: exportUserInfo(doc.user),
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt,
      duration: Math.round(doc.duration / 1000),
      creator: exportUserInfo(doc.creator)
    };

    doc.answers.forEach((answer, i) => obj['#a' + (i + 1)] = answer);
    doc.validity.forEach((validity, i) => obj['?v' + (i + 1)] = !!validity);

    return obj;
  }

  function exportUserInfo(userInfo)
  {
    if (!userInfo)
    {
      return '';
    }

    if (userInfo.label)
    {
      return userInfo.label;
    }

    if (userInfo.id)
    {
      return userInfo.id;
    }

    return '?';
  }
};

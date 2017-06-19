// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function setUpFeedbackRoutes(app, feedbackModule)
{
  const express = app[feedbackModule.config.expressId];
  const userModule = app[feedbackModule.config.userId];
  const Feedback = app[feedbackModule.config.mongooseId].model('Feedback');

  const canView = userModule.auth();

  express.get('/feedback', canView, express.crud.browseRoute.bind(null, app, Feedback));

  express.post('/feedback', canView, prepareBodyForAdd, express.crud.addRoute.bind(null, app, Feedback));

  express.get('/feedback/:id', canView, express.crud.readRoute.bind(null, app, Feedback));

  function prepareBodyForAdd(req, res, next)
  {
    const watch = !!req.body.watch;
    const body = _.pick(req.body, ['type', 'summary', 'comment', 'page', 'navigator', 'versions']);

    body.creator = new ObjectId(req.session.user._id);
    body.savedAt = new Date();
    body.participants = [body.creator];
    body.watchers = watch ? [body.creator] : [];

    next();
  }
};

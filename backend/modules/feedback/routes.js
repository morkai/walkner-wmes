// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function setUpFeedbackRoutes(app, feedbackModule)
{
  var express = app[feedbackModule.config.expressId];
  var userModule = app[feedbackModule.config.userId];
  var Feedback = app[feedbackModule.config.mongooseId].model('Feedback');

  var canView = userModule.auth();

  express.get('/feedback', canView, express.crud.browseRoute.bind(null, app, Feedback));

  express.post('/feedback', canView, prepareBodyForAdd, express.crud.addRoute.bind(null, app, Feedback));

  express.get('/feedback/:id', canView, express.crud.readRoute.bind(null, app, Feedback));

  function prepareBodyForAdd(req, res, next)
  {
    var watch = !!req.body.watch;
    var body = _.pick(req.body, ['type', 'summary', 'comment', 'page', 'navigator', 'versions']);

    body.creator = new ObjectId(req.session.user._id);
    body.savedAt = new Date();
    body.participants = [body.creator];
    body.watchers = watch ? [body.creator] : [];

    next();
  }
};

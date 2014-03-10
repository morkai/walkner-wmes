'use strict';

var crud = require('../express/crud');
var userInfo = require('../../models/userInfo');

module.exports = function setUpFeedbackRoutes(app, feedbackModule)
{
  var express = app[feedbackModule.config.expressId];
  var userModule = app[feedbackModule.config.userId];
  var Feedback = app[feedbackModule.config.mongooseId].model('Feedback');

  var canView = userModule.auth('FEEDBACK:VIEW');

  express.get('/feedback', canView, crud.browseRoute.bind(null, app, Feedback));

  express.post('/feedback', applyCreatorInfo, crud.addRoute.bind(null, app, Feedback));

  express.get('/feedback/:id', canView, crud.readRoute.bind(null, app, Feedback));

  function applyCreatorInfo(req, res, next)
  {
    var userCreator = req.body.creator;

    req.body.creator = userInfo.createObject(req.session.user, req);
    req.body.savedAt = new Date();

    if (userCreator && userCreator.cname && !req.body.creator.cname)
    {
      req.body.creator.cname = userCreator.cname;
    }

    next();
  }
};

/*jshint maxparams:5*/

'use strict';

var lodash = require('lodash');
var crud = require('../express/crud');

module.exports = function setUpProductionRoutes(app, usersModule)
{
  var express = app[usersModule.config.expressId];
  var userModule = app[usersModule.config.userId];
  var User = app[usersModule.config.mongooseId].model('User');

  var canView = userModule.auth('USERS:VIEW');
  var canManage = userModule.auth('USERS:MANAGE');

  express.get('/production/*', function(req, res)
  {
    console.log(req.session.user);

    res.send({});
  });
};

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var bcrypt = require('bcrypt');

module.exports = function setUpUsersRoutes(app, usersModule)
{
  var express = app[usersModule.config.expressId];
  var userModule = app[usersModule.config.userId];
  var User = app[usersModule.config.mongooseId].model('User');

  var canView = userModule.auth('USERS:VIEW');
  var canManage = userModule.auth('USERS:MANAGE');

  express.get('/users', express.crud.browseRoute.bind(null, app, User));

  express.post('/users', canManage, hashPassword, express.crud.addRoute.bind(null, app, User));

  express.get('/users/:id', canViewDetails, express.crud.readRoute.bind(null, app, User));

  express.put('/users/:id', canManage, hashPassword, express.crud.editRoute.bind(null, app, User));

  express.delete('/users/:id', canManage, express.crud.deleteRoute.bind(null, app, User));

  express.post('/login', loginRoute);

  express.get('/logout', logoutRoute);

  function canViewDetails(req, res, next)
  {
    if (req.session.user && req.params.id === req.session.user._id)
    {
      next();
    }
    else
    {
      canView(req, res, next);
    }
  }

  function loginRoute(req, res, next)
  {
    userModule.authenticate(req.body, function(err, user)
    {
      if (err)
      {
        if (err.status < 500)
        {
          app.broker.publish('users.loginFailure', {
            severity: 'warning',
            user: req.session.user,
            login: String(req.body.login)
          });
        }

        return next(err);
      }

      var oldSessionId = req.sessionID;

      req.session.regenerate(function (err)
      {
        if (err)
        {
          return next(err);
        }

        delete user.password;

        user.loggedIn = true;
        user.ipAddress = userModule.getRealIp({}, req);
        user.local = userModule.isLocalIpAddress(user.ipAddress);

        req.session.user = user;

        res.format({
          json: function ()
          {
            res.send(req.session.user);
          },
          default: function ()
          {
            res.redirect('/');
          }
        });

        app.broker.publish('users.login', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID,
          socketId: req.body.socketId
        });
      });
    });
  }

  function logoutRoute(req, res, next)
  {
    var user = lodash.isObject(req.session.user)
      ? req.session.user
      : null;

    var oldSessionId = req.sessionID;

    req.session.regenerate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      var guestUser = lodash.merge({}, userModule.guest);
      guestUser.loggedIn = false;
      guestUser.ipAddress = userModule.getRealIp({}, req);
      guestUser.local = userModule.isLocalIpAddress(guestUser.ipAddress);

      req.session.user = guestUser;

      res.format({
        json: function()
        {
          res.send(204);
        },
        default: function()
        {
          res.redirect('/');
        }
      });

      if (user !== null)
      {
        user.ipAddress = guestUser.ipAddress;

        app.broker.publish('users.logout', {
          user: user,
          oldSessionId: oldSessionId,
          newSessionId: req.sessionID
        });
      }
    });
  }

  /**
   * @private
   */
  function hashPassword(req, res, next)
  {
    if (!lodash.isObject(req.body))
    {
      return next();
    }

    var password = req.body.password;

    if (!lodash.isString(password) || password.length === 0)
    {
      return next();
    }

    bcrypt.hash(password, 10, function(err, hash)
    {
      if (err)
      {
        return next(err);
      }

      req.body.password = hash;

      next();
    });
  }
};

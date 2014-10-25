// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var bcrypt = require('bcrypt');
var step = require('h5.step');

module.exports = function authenticate(app, usersModule, credentials, done)
{
  if (!lodash.isString(credentials.login)
    || lodash.isEmpty(credentials.login)
    || !lodash.isString(credentials.password)
    || lodash.isEmpty(credentials.password))
  {
    var err = new Error('INVALID_CREDENTIALS');
    err.status = 400;

    return setTimeout(done, usersModule.config.loginFailureDelay, err);
  }

  var userModule = app[usersModule.config.userId];

  step(
    function findUserDataStep()
    {
      var next = this.next();

      if (credentials.login !== userModule.root.login)
      {
        app[usersModule.config.mongooseId].model('User').findOne({login: credentials.login}, next);
      }
      else
      {
        next(null, lodash.merge({}, userModule.root));
      }
    },
    function checkUserDataStep(err, userData)
    {
      if (err)
      {
        return this.done(delayLoginFailure.bind(null, err, 500, done));
      }

      if (!userData)
      {
        return this.done(delayLoginFailure.bind(null, new Error('INVALID_LOGIN'), 401, done));
      }

      if (lodash.isFunction(userData.toObject))
      {
        userData = userData.toObject();
      }

      this.userData = userData;
    },
    function comparePasswordStep()
    {
      bcrypt.compare(credentials.password, this.userData.password, this.next());
    },
    function handleComparePasswordResultStep(err, result)
    {
      if (err)
      {
        return this.done(delayLoginFailure.bind(null, err, 500, done));
      }

      if (!result)
      {
        return this.done(delayLoginFailure.bind(null, new Error('INVALID_PASSWORD'), 401, done));
      }

      return this.done(done, null, this.userData);
    }
  );

  function delayLoginFailure(err, statusCode, done)
  {
    err.status = statusCode;

    setTimeout(done, usersModule.config.loginFailureDelay, err);
  }
};

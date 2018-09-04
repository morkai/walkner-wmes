// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {URL} = require('url');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;

module.exports = function setUpOffice365(app, module)
{
  if (!module.config.office365)
  {
    return;
  }

  const express = app[module.config.expressId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');

  passport.use(new AzureAdOAuth2Strategy(module.config.office365.strategy, handleLogin));

  express.get('/auth/office365', function(req, res, next)
  {
    const options = {};

    if (req.query.returnUrl)
    {
      res.cookie('users.returnUrl', req.query.returnUrl, {httpOnly: true});

      options.callbackURL = `${new URL(req.query.returnUrl).origin}/auth/azureadoauth2/callback`;
    }

    passport.authenticate('azure_ad_oauth2', options)(req, res, next);
  });

  express.get(
    '/auth/azureadoauth2/callback',
    function(req, res, next)
    {
      passport.authenticate('azure_ad_oauth2', {session: false}, function(err, user)
      {
        if (err)
        {
          if (err.code === 'USER_NOT_FOUND')
          {
            return res.redirect('/#login?unknown=' + encodeURIComponent(err.email));
          }

          return next(err);
        }

        req.user = user;

        next();
      })(req, res, next);
    },
    module.login
  );

  function handleLogin(accessToken, refreshToken, params, profile, done)
  {
    try
    {
      loginWithEmail(jwt.decode(params.id_token).upn, done);
    }
    catch (err)
    {
      done(err);
    }
  }

  function loginWithEmail(email, done)
  {
    const conditions = {
      email: new RegExp(`^${_.escapeRegExp(email)}$`, 'i'),
      active: true
    };

    User.findOne(conditions).lean().exec((err, user) =>
    {
      if (err)
      {
        return done(err);
      }

      if (!user)
      {
        return done(Object.assign(app.createError(`User not found: ${email}`, 'USER_NOT_FOUND', 400), {email}));
      }

      done(null, user);
    });
  }
};

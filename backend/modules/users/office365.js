// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

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

  express.get('/auth/office365',
    function(req, res, next)
    {
      if (req.query.returnUrl)
      {
        res.cookie('users.returnUrl', req.query.returnUrl, {httpOnly: true});
      }

      next();
    },
    passport.authenticate('azure_ad_oauth2')
  );

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
    User.findOne({email: email, active: true}).lean().exec((err, user) =>
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
// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function lockCommand(app, productionModule, socket, req, reply)
{
  if (!_.isFunction(reply))
  {
    return;
  }

  if (!_.isObject(req))
  {
    return reply(new Error('INVALID_INPUT'));
  }

  var userModule = app[productionModule.config.userId];
  var orgUnits = app[productionModule.config.orgUnitsId];

  step(
    function checkProdLineStep()
    {
      var prodLine = orgUnits.getByTypeAndId('prodLine', req.prodLine);

      if (!prodLine)
      {
        return this.done(reply, new Error('INVALID_PROD_LINE'));
      }

      this.prodLine = prodLine;
    },
    function authenticateStep()
    {
      userModule.authenticate({login: req.login, password: req.password}, this.next());
    },
    function authorizeStep(err, user)
    {
      if (err)
      {
        return this.done(reply, err);
      }

      user.ipAddress = userModule.getRealIp({}, socket);

      if (!user.super && (user.privileges || []).indexOf('DICTIONARIES:MANAGE') === -1)
      {
        app.broker.publish('production.lockFailure', {
          user: user,
          prodLine: this.prodLine._id
        });

        return this.done(reply, new Error('NO_PRIVILEGES'));
      }

      this.user = user;
    },
    function updateSecretKeyStep()
    {
      if (productionModule.secretKeys[this.prodLine._id] !== req.secretKey)
      {
        productionModule.debug(
          "Tried to lock prod line [%s] with a different secret key: %s vs %s",
          this.prodLine._id,
          req.secretKey,
          productionModule.secretKeys[this.prodLine._id]
        );

        return this.done(reply, null);
      }
      else
      {
        this.prodLine.secretKey = null;
        this.prodLine.save(this.next());
      }
    },
    function replyStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to reset a secret key for %s: %s", this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      app.broker.publish('production.locked', {
        user: this.user,
        prodLine: this.prodLine._id,
        secretKey: req.secretKey
      });

      return this.done(reply, null);
    }
  );
};

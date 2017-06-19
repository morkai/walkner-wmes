// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

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

  const userModule = app[productionModule.config.userId];
  const orgUnits = app[productionModule.config.orgUnitsId];

  step(
    function checkProdLineStep()
    {
      const prodLine = orgUnits.getByTypeAndId('prodLine', req.prodLine);

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

      if (!user.super && !_.includes(user.privileges, 'OPERATOR:ACTIVATE'))
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
          'Tried to lock prod line [%s] with a different secret key: %s vs %s',
          this.prodLine._id,
          req.secretKey,
          productionModule.secretKeys[this.prodLine._id]
        );

        return this.done(reply, null);
      }

      this.prodLine.secretKey = null;
      this.prodLine.save(this.next());
    },
    function replyStep(err)
    {
      if (err)
      {
        productionModule.error('Failed to reset a secret key for %s: %s', this.prodLine._id, err.message);

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

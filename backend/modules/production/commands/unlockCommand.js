// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var step = require('h5.step');

module.exports = function unlockCommand(app, productionModule, socket, req, reply)
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
  var mongoose = app[productionModule.config.mongooseId];
  var fteModule = app[productionModule.config.fteId];

  step(
    function checkProdLineStep()
    {
      var prodLine = orgUnits.getByTypeAndId('prodLine', req.prodLine);

      if (!prodLine)
      {
        return this.done(reply, new Error('INVALID_PROD_LINE'));
      }

      if (prodLine.deactivatedAt)
      {
        return this.done(reply, new Error('DEACTIVATED'));
      }

      this.prodLine = prodLine;

      var prodLineState = productionModule.getProdLineState(prodLine._id);

      if (prodLineState && prodLineState.online)
      {
        return this.done(reply, new Error('ALREADY_UNLOCKED'));
      }
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

      if (!user.super && _.includes(user.privileges, 'OPERATOR:ACTIVATE'))
      {
        app.broker.publish('production.unlockFailure', {
          user: user,
          prodLine: this.prodLine._id
        });

        return this.done(reply, new Error('NO_PRIVILEGES'));
      }

      this.user = user;
    },
    function generateSecretKeyStep()
    {
      crypto.pseudoRandomBytes(64, this.next());
    },
    function updateSecretKeyStep(err, secretBytes)
    {
      if (err)
      {
        productionModule.error("Failed to generate a secret key for %s: %s", this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      var secretKey = crypto.createHash('md5').update(secretBytes).digest('hex');

      productionModule.secretKeys[this.prodLine._id] = secretKey;

      this.prodLine.secretKey = secretKey;
      this.prodLine.save(this.next());
    },
    function fetchProdShiftStep(err)
    {
      if (err)
      {
        productionModule.error("Failed to save a secret key for %s: %s", this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      if (this.prodLine.prodShift)
      {
        mongoose.model('ProdShift')
          .findById(this.prodLine.prodShift)
          .lean()
          .exec(this.parallel());

        var doneProdShiftOrder = this.parallel();

        if (this.prodLine.prodShiftOrder)
        {
          mongoose.model('ProdShiftOrder')
            .findById(this.prodLine.prodShiftOrder)
            .lean()
            .exec(doneProdShiftOrder);
        }
        else
        {
          doneProdShiftOrder(null, null);
        }

        mongoose.model('ProdDowntime')
          .find({prodLine: this.prodLine._id})
          .sort({startedAt: -1})
          .limit(8)
          .lean()
          .exec(this.parallel());
      }
    },
    function replyStep(err, prodShift, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error("Failed to fetch prod data after unlock for %s: %s", this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      app.broker.publish('production.unlocked', {
        user: this.user,
        prodLine: this.prodLine._id,
        secretKey: this.prodLine.secretKey
      });

      if (!prodShift || prodShift.date.getTime() !== fteModule.getCurrentShift().date.getTime())
      {
        prodShift = null;
      }

      return this.done(reply, null, {
        secretKey: this.prodLine.secretKey,
        prodShift: prodShift,
        prodShiftOrder: prodShift && prodShiftOrder && !prodShiftOrder.finishedAt ? prodShiftOrder : null,
        prodDowntimes: prodShift && !_.isEmpty(prodDowntimes) ? prodDowntimes : []
      });
    }
  );
};

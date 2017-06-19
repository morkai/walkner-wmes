// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const crypto = require('crypto');
const _ = require('lodash');
const step = require('h5.step');

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

  const userModule = app[productionModule.config.userId];
  const orgUnits = app[productionModule.config.orgUnitsId];
  const mongoose = app[productionModule.config.mongooseId];
  const fteModule = app[productionModule.config.fteId];
  const res = {
    prodLine: req.prodLine
  };

  step(
    function checkProdLineStep()
    {
      const prodLine = orgUnits.getByTypeAndId('prodLine', req.prodLine);

      if (!prodLine)
      {
        return this.done(reply, new Error('INVALID_PROD_LINE'));
      }

      if (prodLine.deactivatedAt)
      {
        return this.done(reply, new Error('DEACTIVATED'));
      }

      this.prodLine = prodLine;

      const prodLineState = productionModule.getProdLineState(prodLine._id);

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

      if (!user.super && !_.includes(user.privileges, 'OPERATOR:ACTIVATE'))
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
        productionModule.error('Failed to generate a secret key for %s: %s', this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      res.secretKey = crypto.createHash('md5').update(secretBytes).digest('hex');

      productionModule.secretKeys[this.prodLine._id] = res.secretKey;

      this.prodLine.secretKey = res.secretKey;
      this.prodLine.save(this.next());
    },
    function fetchProdShiftStep(err)
    {
      if (err)
      {
        productionModule.error('Failed to save a secret key for %s: %s', this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      if (this.prodLine.prodShift)
      {
        mongoose.model('ProdShift')
          .findById(this.prodLine.prodShift)
          .lean()
          .exec(this.parallel());

        const doneProdShiftOrder = this.parallel();

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
    function fetchDictionaries(err, prodShift, prodShiftOrder, prodDowntimes)
    {
      if (err)
      {
        productionModule.error('Failed to fetch prod data after unlock for %s: %s', this.prodLine._id, err.message);

        return this.done(reply, err);
      }

      if (!prodShift || prodShift.date.getTime() !== fteModule.getCurrentShift().date.getTime())
      {
        prodShift = null;
      }

      res.prodShift = prodShift;
      res.prodShiftOrder = prodShift && prodShiftOrder && !prodShiftOrder.finishedAt ? prodShiftOrder : null;
      res.prodDowntimes = prodShift && !_.isEmpty(prodDowntimes) ? prodDowntimes : [];
      res.dictionaries = {};

      _.forEach(app.options.dictionaryModules, function(dictionaryName, moduleName)
      {
        const models = app[moduleName].models;

        res.dictionaries[dictionaryName] = _.invokeMap(
          models,
          typeof models[0].toDictionaryObject === 'function' ? 'toDictionaryObject' : 'toJSON'
        );
      });

      setImmediate(this.next());
    },
    function filterSortDictionariesStep()
    {
      _.forEach(res.dictionaries, (models, dictionaryName) =>
      {
        setTimeout(
          sortDictionary,
          Math.round(Math.random() * 20) + 1,
          res.dictionaries,
          dictionaryName,
          this.group()
        );
      });
    },
    function replyStep()
    {
      app.broker.publish('production.unlocked', {
        user: this.user,
        prodLine: this.prodLine._id,
        secretKey: this.prodLine.secretKey
      });

      return this.done(reply, null, res);
    }
  );

  function sortDictionary(dictionaries, dictionaryName, done)
  {
    dictionaries[dictionaryName] = dictionaries[dictionaryName]
      .filter(m => !m.deactivatedAt)
      .sort((a, b) => a._id.toString().localeCompare(b._id.toString()));

    done();
  }
};

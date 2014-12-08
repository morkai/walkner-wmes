// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var inspect = require('util').inspect;
var crypto = require('crypto');
var lodash = require('lodash');
var step = require('h5.step');
var logEntryHandlers = require('./logEntryHandlers');

module.exports = function setUpProductionsCommands(app, productionModule)
{
  var sio = app[productionModule.config.sioId];
  var mongoose = app[productionModule.config.mongooseId];
  var userModule = app[productionModule.config.userId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var orgUnits = app[productionModule.config.orgUnitsId];
  var fteModule = app[productionModule.config.fteId];
  var secretKeys = {};

  cacheSecretKeys();

  app.broker.subscribe('prodLines.*', cacheSecretKeys);

  sio.sockets.on('connection', function(socket)
  {
    socket.on('production.unlock', function(req, reply)
    {
      if (!lodash.isFunction(reply))
      {
        return;
      }

      if (!lodash.isObject(req))
      {
        return reply(new Error('INVALID_INPUT'));
      }

      step(
        function checkProdLineStep()
        {
          var prodLine = orgUnits.getByTypeAndId('prodLine', req.prodLine);

          if (!prodLine)
          {
            return this.done(reply, new Error('INVALID_PROD_LINE'));
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

          if (!user.super && (user.privileges || []).indexOf('DICTIONARIES:MANAGE') === -1)
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

          secretKeys[this.prodLine._id] = secretKey;

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
            prodDowntimes: prodShift && !lodash.isEmpty(prodDowntimes) ? prodDowntimes : []
          });
        }
      );
    });

    socket.on('production.lock', function(req, reply)
    {
      if (!lodash.isFunction(reply))
      {
        return;
      }

      if (!lodash.isObject(req))
      {
        return reply(new Error('INVALID_INPUT'));
      }

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
          if (secretKeys[this.prodLine._id] !== req.secretKey)
          {
            productionModule.debug(
              "Tried to lock prod line [%s] with a different secret key: %s vs %s",
              this.prodLine._id,
              req.secretKey,
              secretKeys[this.prodLine._id]
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
    });

    socket.on('production.sync', function(logEntryStream, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (!lodash.isString(logEntryStream))
      {
        return reply();
      }

      logEntryStream = logEntryStream.split('\n');

      var lastLogEntryIndex = logEntryStream.length - 1;
      var logEntryList = [];
      var creator = userModule.createUserInfo(socket.handshake.user, socket);
      var lastLogEntryWithInvalidSecretKey = null;

      logEntryStream.forEach(function(logEntryJson, i)
      {
        try
        {
          var logEntry = JSON.parse(logEntryJson);

          if (!lodash.isObject(logEntry))
          {
            return logInvalidEntry(new Error('TYPE'), logEntryJson);
          }

          if (!lodash.isFunction(logEntryHandlers[logEntry.type]))
          {
            return logInvalidEntry(new Error('UNKNOWN_HANDLER'), logEntryJson);
          }

          if (!validateSecretKey(logEntry))
          {
            if (i === lastLogEntryIndex)
            {
              lastLogEntryWithInvalidSecretKey = logEntry;
            }

            return logInvalidEntry(new Error('SECRET_KEY'), logEntryJson);
          }

          if (!logEntry.creator)
          {
            logEntry.creator = creator;
          }
          else
          {
            logEntry.creator.ip = creator.ip;
          }

          logEntry.savedAt = new Date();
          logEntry.todo = true;

          logEntryList.push(new ProdLogEntry(logEntry).toObject());
        }
        catch (err)
        {
          logInvalidEntry(err, logEntryJson);
        }
      });

      if (lastLogEntryWithInvalidSecretKey)
      {
        socket.emit('production.locked', {
          secretKey: lastLogEntryWithInvalidSecretKey.secretKey,
          prodLine: lastLogEntryWithInvalidSecretKey.prodLine
        });
      }

      if (logEntryList.length === 0)
      {
        return reply();
      }

      ProdLogEntry.collection.insert(logEntryList, {continueOnError: true}, function(err)
      {
        if (err)
        {
          if (err.code === 11000)
          {
            var dupEntryId = (err.message || err.errmsg || err.err).match(/"(.*?)"/)[1];
            var dupEntry = lodash.find(logEntryList, function(logEntry)
            {
              return logEntry._id === dupEntryId;
            });

            productionModule.warn(
              "Duplicate log entry detected: %s", inspect(dupEntry, {colors: false, depth: 10})
            );
          }
          else
          {
            productionModule.error("Error during saving of log entries: %s", (err.stack || err.errmsg || err.err));
          }
        }

        reply();

        if (!productionModule.recreating)
        {
          app.broker.publish('production.logEntries.saved');
        }
      });
    });

    socket.on('production.getPlannedQuantities', function(prodShiftId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        return;
      }

      productionModule.getProdData('shift', prodShiftId, function(err, prodShift)
      {
        if (err)
        {
          return reply(err);
        }

        if (!prodShift)
        {
          return reply(new Error('UNKNOWN_PROD_SHIFT'));
        }

        var plannedQuantities = prodShift.quantitiesDone.map(function(quantityDone)
        {
          return quantityDone.planned;
        });

        reply(null, plannedQuantities);
      });
    });

    socket.on('production.join', function(message)
    {
      if (!lodash.isObject(message))
      {
        return;
      }

      var prodLineState = productionModule.getProdLineState(message.prodLineId);

      if (prodLineState)
      {
        prodLineState.onClientJoin(socket, message);
      }
    });

    socket.on('production.leave', function(prodLineId)
    {
      var prodLineState = productionModule.getProdLineState(prodLineId);

      if (prodLineState)
      {
        prodLineState.onClientLeave(socket);
      }
    });
  });

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.stack, logEntryJson);
  }

  function cacheSecretKeys()
  {
    secretKeys = {};

    orgUnits.getAllByType('prodLine').forEach(function(prodLine)
    {
      var secretKey = prodLine.secretKey;

      if (secretKey)
      {
        secretKeys[prodLine._id] = secretKey;
      }
    });
  }

  function validateSecretKey(logEntry)
  {
    return typeof logEntry.secretKey === 'string' && logEntry.secretKey === secretKeys[logEntry.prodLine];
  }
};

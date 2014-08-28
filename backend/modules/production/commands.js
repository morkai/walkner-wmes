// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var inspect = require('util').inspect;
var crypto = require('crypto');
var lodash = require('lodash');
var logEntryHandlers = require('./logEntryHandlers');

module.exports = function setUpProductionsCommands(app, productionModule)
{
  var sio = app[productionModule.config.sioId];
  var mongoose = app[productionModule.config.mongooseId];
  var userModule = app[productionModule.config.userId];
  var ProdLogEntry = mongoose.model('ProdLogEntry');
  var prodLines = app[productionModule.config.prodLinesId];
  var secretKeys = {};

  cacheSecretKeys();

  app.broker.subscribe('prodLines.*', cacheSecretKeys);

  sio.sockets.on('connection', function(socket)
  {
    socket.on('production.getSecretKey', function(prodLineId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        return;
      }

      var user = socket.handshake.user;

      if (!user || (!user.super && (user.privileges || []).indexOf('DICTIONARIES:MANAGE') === -1))
      {
        return reply(new Error('AUTH'));
      }

      var prodLine = lodash.find(prodLines.models, function(prodLine)
      {
        return prodLine.get('_id') === prodLineId;
      });

      if (!prodLine)
      {
        return reply(new Error('UNKNOWN'));
      }

      var secretKey = prodLine.get('secretKey');

      if (typeof secretKey === 'string' && secretKey.length === 32)
      {
        return reply(null, secretKey);
      }

      crypto.pseudoRandomBytes(64, function(err, bytes)
      {
        if (err)
        {
          productionModule.error(
            "Failed to generate a secret key for %s: %s", prodLineId, err.stack
          );

          return reply(err);
        }

        secretKey = crypto.createHash('md5').update(bytes).digest('hex');

        secretKeys[prodLineId] = secretKey;

        prodLine.set('secretKey', secretKey);
        prodLine.save(function(err)
        {
          if (err)
          {
            productionModule.error(
              "Failed to save a secret key for %s: %s", prodLineId, err.stack
            );

            return reply(err);
          }

          reply(null, secretKey);
        });
      });
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

      var logEntryList = [];
      var creator = userModule.createUserInfo(socket.handshake.user, socket);

      logEntryStream.split('\n').forEach(function(logEntryJson)
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
            var dupEntryId = err.message.match(/"(.*?)"/)[1];
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
            productionModule.error("Error during saving of log entries: %s", err.stack);
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

    socket.on('production.join', function(prodLineStateData)
    {
      if (!lodash.isObject(prodLineStateData) || !prodLines.modelsById[prodLineStateData._id])
      {
        return;
      }

      productionModule.updateProdLineState(lodash.extend(prodLineStateData, {online: true}));

      var prodLineId = prodLineStateData._id;

      socket.on('disconnect', function()
      {
        productionModule.updateProdLineState({
          _id: prodLineId,
          online: false
        });
      });
    });

    socket.on('production.leave', function(prodLineId)
    {
      productionModule.updateProdLineState({
        _id: prodLineId,
        online: false
      });
    });

    socket.on('production.updateState', function(prodLineState)
    {
      productionModule.updateProdLineState(prodLineState);
    });
  });

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.stack, logEntryJson);
  }

  function cacheSecretKeys()
  {
    secretKeys = {};

    prodLines.models.forEach(function(prodLine)
    {
      var secretKey = prodLine.get('secretKey');

      if (secretKey)
      {
        secretKeys[prodLine.get('_id')] = secretKey;
      }
    });
  }

  function validateSecretKey(logEntry)
  {
    if (typeof logEntry.secretKey !== 'string')
    {
      return false;
    }

    return logEntry.secretKey === secretKeys[logEntry.prodLine];
  }
};

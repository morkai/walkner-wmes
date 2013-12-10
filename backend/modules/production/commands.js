'use strict';

var crypto = require('crypto');
var lodash = require('lodash');
var userInfo = require('../../models/userInfo');

module.exports = function setUpProductionsCommands(app, productionModule)
{
  var sio = app[productionModule.config.sioId];
  var mongoose = app[productionModule.config.mongooseId];
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
        reply = function() {};
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
            "Failed to generate a secret key for %s: %s", prodLineId, err.message
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
              "Failed to save a secret key for %s: %s", prodLineId, err.message
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
      var creator = userInfo.createObject(socket.handshake.user, socket);

      logEntryStream.split('\n').forEach(function(logEntryJson)
      {
        try
        {
          var logEntry = JSON.parse(logEntryJson);

          if (!lodash.isObject(logEntry))
          {
            return logInvalidEntry(new Error("TYPE"), logEntryJson);
          }

          if (!validateSecretKey(logEntry))
          {
            return logInvalidEntry(new Error("SECRET_KEY"), logEntryJson);
          }

          logEntry.creator = creator;
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

      setImmediate(function()
      {
        productionModule.debug("Saving log entries...");

        ProdLogEntry.collection.insert(logEntryList, {continueOnError: true}, function(err, docs)
        {
          if (err)
          {
            productionModule.error("Error during saving of log entries: %s", err.message);
          }

          productionModule.debug("Saved %d of %d!", docs ? docs.length : 0, logEntryList.length);

          reply();
        });
      });
    });
  });

  function logInvalidEntry(err, logEntryJson)
  {
    productionModule.debug("Invalid log entry: %s\n%s", err.message, logEntryJson);
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

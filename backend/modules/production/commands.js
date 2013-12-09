'use strict';

var crypto = require('crypto');
var lodash = require('lodash');

module.exports = function setUpProductionsCommands(app, productionModule)
{
  var sio = app[productionModule.config.sioId];
  var mongoose = app[productionModule.config.mongooseId];
  var prodLines = app[productionModule.config.prodLinesId];

  sio.sockets.on('connection', function(socket)
  {
    socket.on('production.getSecretKey', function(prodLineId, reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      var user = socket.handshake.user;
console.log(user);
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

      if (typeof secretKey === 'string')
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

        secretKey = crypto.createHash('sha1').update(bytes).digest('md5');

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

      logEntryStream.split('\n').forEach(function(logEntryJson)
      {
        try
        {
          var historyEntry = JSON.parse(logEntryJson);

          if (lodash.isObject(historyEntry))
          {
            logEntryList.push(historyEntry);
          }
        }
        catch (err)
        {
          productionModule.debug("Invalid log entry: %s\n%s", err.message, logEntryJson);
        }
      });

      if (logEntryList.length === 0)
      {
        return reply();
      }

      productionModule.debug("Syncing...");

      logEntryList.forEach(function(logEntry)
      {
        console.log(logEntry);
      });

      productionModule.debug("Synced!");

      reply();
    });
  });
};

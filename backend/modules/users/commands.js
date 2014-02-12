'use strict';

var lodash = require('lodash');

module.exports = function setUpUsersCommands(app, usersModule)
{
  var sio = app[usersModule.config.sioId];
  var mongoose = app[usersModule.config.mongooseId];
  var User = mongoose.model('User');
  var companies = app[usersModule.config.companiesId];

  usersModule.syncing = false;

  sio.sockets.on('connection', function(socket)
  {
    socket.on('users.sync', function(reply)
    {
      if (!lodash.isFunction(reply))
      {
        reply = function() {};
      }

      if (usersModule.syncing)
      {
        return reply();
      }

      var user = socket.handshake.user || {privileges: []};

      if (!user.super && user.privileges.indexOf('USERS:MANAGE') === -1)
      {
        return reply(new Error('AUTH'));
      }

      if (typeof usersModule.config.sqlConnStr !== 'string')
      {
        usersModule.warn("Failed to sync: no connection string");

        return reply(new Error('MODULE'));
      }

      var sqlserver;

      try
      {
        sqlserver = require('sqlserver');
      }
      catch (err)
      {
        usersModule.warn("Failed to sync: %s", err.message);

        return reply(new Error('MODULE'));
      }

      usersModule.info("Syncing...");

      usersModule.syncing = true;

      reply();

      try
      {
        sqlserver.open(usersModule.config.sqlConnStr, onConnect);
      }
      catch (err)
      {
        onConnect(err);
      }

      function onConnect(err, conn)
      {
        if (err)
        {
          usersModule.error("Failed to sync: %s", err.message);

          usersModule.syncing = false;

          app.broker.publish('users.syncFailed', {user: user, error: err.message});
        }
        else
        {
          queryUsers(conn);
        }
      }

      function queryUsers(conn)
      {
        var stmt = conn.queryRaw(createFetchUserSql());
        var rows = [];
        var row = null;

        stmt.on('error', function(err)
        {
          usersModule.error("Failed to sync: %s", err.message);

          usersModule.syncing = false;

          app.broker.publish('users.syncFailed', {user: user, error: err.message});
        });

        stmt.on('row', function()
        {
          if (row !== null)
          {
            rows.push(prepareUserRow(row));
          }

          row = new Array(7);
        });

        stmt.on('column', function(columnIdx, data)
        {
          row[columnIdx] = data;
        });

        stmt.on('done', function()
        {
          conn.close();

          if (row !== null)
          {
            rows.push(prepareUserRow(row));
          }

          syncNextUserRow(rows, {created: 0, updated: 0});
        });
      }
    });
  });

  function createFetchUserSql()
  {
    /*jshint multistr:true*/

    var sql = "\
      SELECT\
        [USERS].[US_ID],\
        [CARDS].[CA_NUMBER],\
        [USERS].[US_NAME],\
        [USERS].[US_SURNAME],\
        [USERS].[US_PERSONELLID],\
        [USERS].[US_ADD_FIELDS],\
        [USERS].[US_ACTIVE]\
      FROM [USERS]\
      LEFT JOIN [CARDS] ON [USERS].[US_CARD_ID]=[CARDS].[CA_ID]\
    ";
    var where = [];

    companies.models.forEach(function(companyModel)
    {
      var companyId = companyModel.get('_id').replace(/'/g, "\\'");

      where.push("[USERS].[US_ADD_FIELDS] LIKE '10001&" + companyId + "&%'");
    });

    return sql + " WHERE " + where.join(" OR ");
  }

  function prepareUserRow(row)
  {
    var addFieldList = String(row[5]).split('&');
    var addFieldMap = {};

    for (var i = 0, l = addFieldList.length; i < l; i += 2)
    {
      var key = addFieldList[i];

      if (key == null || key === '')
      {
        continue;
      }

      addFieldMap[key] = addFieldList[i + 1];
    }

    row[5] = addFieldMap;

    return row;
  }

  function syncNextUserRow(rows, stats)
  {
    if (rows.length === 0)
    {
      usersModule.info("Synced (%d created, %d updated)!", stats.created, stats.updated);

      usersModule.syncing = false;

      app.broker.publish('users.synced', stats);

      return;
    }

    var row = rows.shift();
    var kdId = parseInt(row[0], 10);

    User.findOne({kdId: kdId}, function(err, userModel)
    {
      if (err)
      {
        usersModule.error("Failed to find a user by KD ID %s: %s", kdId, err.message);

        return syncNextUserRow(rows, stats);
      }

      var isNew = false;
      var data = {
        kdId: kdId,
        card: String(row[1]),
        firstName: row[2],
        lastName: row[3],
        personellId: row[4],
        active: row[6] === 1,
        company: row[5]['10001'],
        kdDivision: row[5]['10003'],
        kdPosition: row[5]['10004']
      };

      if (userModel === null)
      {
        data.login = data.personellId;
        data.password = ']:->';

        isNew = true;
        userModel = new User(data);
      }
      else
      {
        userModel.set(data);
      }

      userModel.save(function(err)
      {
        if (err)
        {
          usersModule.error("Failed to save a user with KD ID %s: %s", kdId, err.message);
        }
        else if (isNew)
        {
          ++stats.created;
        }
        else
        {
          ++stats.updated;
        }

        return syncNextUserRow(rows, stats);
      });
    });
  }
};

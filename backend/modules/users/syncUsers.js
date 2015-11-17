// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function syncUsers(app, usersModule, done)
{
  var tedious;

  try
  {
    tedious = require('tedious');
  }
  catch (err)
  {
    return done(new Error('MODULE'));
  }

  if (!usersModule.config.tediousConnection)
  {
    return done(new Error('MODULE'));
  }

  var companies = app[usersModule.config.companiesId];
  var mongoose = app[usersModule.config.mongooseId];
  var User = mongoose.model('User');

  var conn = new tedious.Connection(usersModule.config.tediousConnection);

  conn.on('error', function(err)
  {
    usersModule.error("[tedious] %s", err.message);
  });

  conn.on('connect', function(err)
  {
    /*jshint multistr:true*/

    if (err)
    {
      return done(err);
    }

    queryUsers(conn);
  });

  function createSelectUsersSql()
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

    _.forEach(companies.models, function(companyModel)
    {
      var companyId = companyModel.get('_id').replace(/'/g, "\\'");

      where.push("[USERS].[US_ADD_FIELDS] LIKE '10001&" + companyId + "&%'");
    });

    return sql + " WHERE " + where.join(" OR ") + " ORDER BY [USERS].[US_ID]";
  }

  function queryUsers(conn)
  {
    var stats = {
      created: 0,
      updated: 0,
      errors: 0
    };
    var kdUsers = [];

    var req = new tedious.Request(createSelectUsersSql(), function(err)
    {
      conn.close();

      if (err)
      {
        done(err);
      }
      else
      {
        setImmediate(syncNextUser, stats, kdUsers, 0);
      }
    });

    req.on('row', function(row)
    {
      var addFields = parseAddFields(row[5].value);

      kdUsers.push({
        kdId: +row[0].value,
        card: _.isString(row[1].value) && !_.isEmpty(row[1].value) ? row[1].value.toString() : null,
        firstName: row[2].value,
        lastName: row[3].value,
        personellId: row[4].value,
        active: row[6].value === 1,
        company: addFields['10001'] || null,
        kdDivision: addFields['10003'] || null,
        kdPosition: addFields['10004'] || null
      });
    });

    conn.execSql(req);
  }

  function syncNextUser(stats, kdUsers, kdUserIndex)
  {
    if (kdUserIndex === kdUsers.length)
    {
      return setImmediate(done, null, stats);
    }

    var kdUser = kdUsers[kdUserIndex];

    step(
      function findUserModelStep()
      {
        if (!kdUser.personellId)
        {
          return this.skip();
        }

        User.findOne({kdId: kdUser.kdId}, this.next());
      },
      function prepareUserModelStep(err, userModel)
      {
        if (err)
        {
          usersModule.error("Failed to find a user by KD ID [%s]: %s", kdUser.kdId, err.message);

          ++stats.errors;

          return this.skip();
        }

        this.isNew = false;

        if (userModel)
        {
          userModel.set(kdUser);
        }
        else
        {
          this.isNew = true;

          kdUser.login = kdUser.personellId;
          kdUser.password = ']:->';

          userModel = new User(kdUser);
        }

        if (!userModel.gender)
        {
          userModel.gender = /a$/i.test(userModel.firstName) ? 'female' : 'male';
        }

        this.userModel = userModel;
      },
      function saveUserModelStep()
      {
        saveUserModel(this.userModel, this.isNew, false, stats, this.next());
      },
      function finalizeStep()
      {
        this.userModel = null;

        setImmediate(syncNextUser, stats, kdUsers, kdUserIndex + 1);
      }
    );
  }

  function saveUserModel(userModel, isNew, isRetry, stats, done)
  {
    userModel.save(function(err)
    {
      if (err)
      {
        var error = err.message;

        if (err.name === 'ValidationError')
        {
          error += ':\n' + _.map(err.errors, function(e) { return e.toString(); }).join('\n');
        }

        usersModule.error("Failed to save a user with KD ID [%s]: %s", userModel.kdId, error);

        if (err.code === 11000 && !isRetry)
        {
          return updateOldUserModel(userModel, stats, done);
        }

        ++stats.errors;
      }
      else if (isNew)
      {
        ++stats.created;
      }
      else
      {
        ++stats.updated;
      }

      return done();
    });
  }

  function updateOldUserModel(newUserModel, stats, done)
  {
    User.findOne({login: newUserModel.login}).exec(function(err, oldUserModel)
    {
      if (err || !oldUserModel)
      {
        return done();
      }

      oldUserModel.set({
        card: newUserModel.card,
        firstName: newUserModel.firstName,
        lastName: newUserModel.lastName,
        personellId: newUserModel.personellId,
        active: newUserModel.active,
        company: newUserModel.company,
        kdDivision: newUserModel.kdDivision,
        kdPosition: newUserModel.kdPosition
      });

      setImmediate(saveUserModel, oldUserModel, false, true, stats, done);
    });
  }
};

function parseAddFields(addFields)
{
  if (!_.isString(addFields) || _.isEmpty(addFields))
  {
    return {};
  }

  var addFieldList = addFields.split('&');
  var addFieldMap = {};

  for (var i = 0, l = addFieldList.length; i < l; i += 2)
  {
    var key = addFieldList[i].trim();

    if (key == null || key === '')
    {
      continue;
    }

    addFieldMap[key] = addFieldList[i + 1].trim();
  }

  return addFieldMap;
}

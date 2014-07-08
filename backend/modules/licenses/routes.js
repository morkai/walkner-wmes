// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');

module.exports = function setUpLicensesRoutes(app, licensesModule)
{
  var express = app[licensesModule.config.expressId];
  var userModule = app[licensesModule.config.userId];
  var mongoose = app[licensesModule.config.mongooseId];
  var License = mongoose.model('License');
  var LicensePing = mongoose.model('LicensePing');

  var canView = userModule.auth('LICENSES:VIEW');
  var canManage = userModule.auth('LICENSES:MANAGE');

  express.get('/licenses', canView, express.crud.browseRoute.bind(null, app, License));

  express.post('/licenses', canManage, express.crud.addRoute.bind(null, app, License));

  express.get('/licenses/:id', canView, express.crud.readRoute.bind(null, app, License));

  express.put('/licenses/:id', canManage, express.crud.editRoute.bind(null, app, License));

  express.post('/licenses/:id;ping', pingRoute);

  express.delete('/licenses/:id', canManage, express.crud.deleteRoute.bind(null, app, License));

  function pingRoute(req, res, next)
  {
    var uuid = req.params.id;
    var encryptedUuid = req.body.uuid || '';
    var decryptedUuid = null;

    try
    {
      decryptedUuid = licensesModule.licenseEdKey.decrypt(encryptedUuid, 'base64', 'utf8');
    }
    catch (err) {}

    if (decryptedUuid === null || uuid !== decryptedUuid)
    {
      res.statusCode = 400;

      return next(new Error('INVALID_INPUT'));
    }

    License.findById(uuid, {_id: 1}).lean().exec(function(err, license)
    {
      if (err)
      {
        return next(err);
      }

      delete req.body.uuid;

      var ip = req.ip;

      if (!license)
      {
        saveLicensePing(uuid, ip, false, req.body);

        return res.send('UNKNOWN_LICENSE', 404);
      }

      var conditions = {
        uuid: license._id,
        pingedAt: {$gte: moment().subtract('hours', 8).toDate()},
        granted: true,
        ip: {$ne: ip}
      };

      LicensePing.findOne(conditions, {ip: 1}).lean().exec(function(err, licensePing)
      {
        if (err)
        {
          return next(err);
        }

        if (licensePing)
        {
          res.send('DUPLICATE_LICENSE', 400);
        }
        else
        {
          res.end();
        }

        saveLicensePing(uuid, ip, !licensePing, req.body);
      });
    });
  }

  function saveLicensePing(uuid, ip, granted, meta)
  {
    var licensePing = new LicensePing({
      uuid: uuid,
      pingedAt: new Date(),
      ip: ip,
      granted: granted,
      meta: meta
    });

    licensePing.save(function(err)
    {
      if (err)
      {
        licensesModule.error(
          "Failed to save a new license ping: %s\nLicense ping: %s",
          err.message,
          licensePing.toJSON()
        );
      }
      else
      {
        licensesModule.info(
          "%s [%s] access to the license [%s].",
          licensePing.granted ? "Granted" : "Denied",
          licensePing.ip,
          licensePing.uuid
        );
      }
    });
  }
};

// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var uuid = require('uuid/v4');
var moment = require('moment');

module.exports = function setUpLicensesRoutes(app, licensesModule)
{
  var express = app[licensesModule.config.expressId];
  var userModule = app[licensesModule.config.userId];
  var mongoose = app[licensesModule.config.mongooseId];
  var License = mongoose.model('License');
  var LicensePing = mongoose.model('LicensePing');

  var canView = userModule.auth('DICTIONARIES:VIEW');
  var canManage = userModule.auth('LICENSES:MANAGE');

  express.get('/licenses', canView, express.crud.browseRoute.bind(null, app, License));

  express.post('/licenses',
    canManage,
    prepareLicenseForAdd,
    generateLicenseKey,
    express.crud.addRoute.bind(null, app, License)
  );

  express.get('/licenses/:id', canView, express.crud.readRoute.bind(null, app, License));

  express.put(
    '/licenses/:id',
    canManage,
    prepareLicenseForEdit,
    generateLicenseKey,
    express.crud.editRoute.bind(null, app, License)
  );

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

        return res.status(404).send('UNKNOWN_LICENSE');
      }

      var conditions = {
        uuid: license._id,
        pingedAt: {$gte: moment().subtract(8, 'hours').toDate()},
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
          res.status(400).send('DUPLICATE_LICENSE');
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

  function prepareLicenseForAdd(req, res, next)
  {
    if (_.isEmpty(req.body._id))
    {
      req.body._id = uuid.toUpperCase();
    }

    prepareLicenseDate(req.body);

    return next();
  }

  function prepareLicenseForEdit(req, res, next)
  {
    req.body._id = req.params.id;

    prepareLicenseDate(req.body);

    return next();
  }

  function prepareLicenseDate(license)
  {
    if (_.isString(license.date) && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(license.date))
    {
      license.date = moment(license.date, 'YYYY-MM-DD').toDate();
    }
  }

  function generateLicenseKey(req, res, next)
  {
    try
    {
      req.body.key = licensesModule.generateLicenseKey(req.body);
    }
    catch (err)
    {
      res.status(400);

      return next(err);
    }

    return next();
  }
};

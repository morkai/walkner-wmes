// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var step = require('h5.step');

module.exports = function importRoute(app, icpoModule, req, res, next)
{
  if (!req.is('application/zip'))
  {
    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  var uuid = req.query.uuid;

  if (!/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/.test(uuid))
  {
    return res.status(400).send('INVALID_UUID');
  }

  var mongoose = app[icpoModule.config.mongooseId];
  var License = mongoose.model('License');
  var IcpoResult = mongoose.model('IcpoResult');

  var srcIp = req.socket.remoteAddress;
  var zipFileHash = crypto.createHash('md5')
    .update(uuid)
    .update(Math.random().toString())
    .digest('hex');
  var zipFileName = Math.round(Date.now() / 1000).toString() + '@' + srcIp + '@' + zipFileHash;
  var zipFilePath = path.join(icpoModule.config.zipStoragePath, zipFileName);

  step(
    function()
    {
      var eightHoursAgo = moment().subtract(8, 'hours').toDate();

      License.findById(uuid, {appId: 1})
        .lean()
        .exec(this.parallel());

      IcpoResult.distinct('srcIp', {startedAt: {$gte: eightHoursAgo}, srcUuid: uuid})
        .lean()
        .exec(this.parallel());
    },
    function(err, license, srcIps)
    {
      if (err)
      {
        return this.skip(err);
      }

      res.type('text/plain');

      if (!license)
      {
        return this.skip('UNKNOWN_LICENSE', 400);
      }

      if (srcIps.length > 1 || (srcIps.length === 1 && srcIps[0] !== srcIp))
      {
        return this.skip('DUPLICATE_LICENSE', 400);
      }

      var writeStream = fs.createWriteStream(zipFilePath);

      writeStream.once('finish', this.parallel());
      req.once('end', this.parallel());

      req.pipe(writeStream);
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      fs.rename(zipFilePath, zipFilePath + '.zip', this.next());
    },
    function(err, statusCode)
    {
      if (err)
      {
        if (typeof statusCode === 'number')
        {
          return res.status(statusCode).send(err);
        }

        return next(err);
      }

      return res.sendStatus(204);
    }
  );
};

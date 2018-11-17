// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const step = require('h5.step');
const fs = require('fs-extra');

module.exports = function importRoute(app, icpoModule, req, res, next)
{
  if (!req.is('application/zip'))
  {
    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  const uuid = req.query.uuid;

  if (!/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/.test(uuid))
  {
    return res.status(400).send('INVALID_UUID');
  }

  const mongoose = app[icpoModule.config.mongooseId];
  const License = mongoose.model('License');
  const IcpoResult = mongoose.model('IcpoResult');

  const srcIp = req.socket.remoteAddress;
  const zipFileHash = crypto.createHash('md5')
    .update(uuid)
    .update(Math.random().toString())
    .digest('hex');
  const zipFileName = Math.round(Date.now() / 1000).toString() + '@' + srcIp + '@' + zipFileHash;
  const zipFilePath = path.join(icpoModule.config.zipStoragePath, zipFileName);

  step(
    function()
    {
      const eightHoursAgo = moment().subtract(8, 'hours').toDate();

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

      const writeStream = fs.createWriteStream(zipFilePath);

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

      fs.move(zipFilePath, zipFilePath + '.zip', {overwrite: true}, this.next());
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

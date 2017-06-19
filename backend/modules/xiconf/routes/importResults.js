// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var step = require('h5.step');
var fs = require('fs-extra');

module.exports = function importResultsRoute(app, xiconfModule, req, res, next)
{
  if (!req.is('application/zip'))
  {
    res.statusCode = 400;

    return res.status(400).send('INVALID_CONTENT_TYPE');
  }

  var uuid = req.query.uuid;

  if (!/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/.test(uuid))
  {
    return res.status(400).send('INVALID_UUID');
  }

  var mongoose = app[xiconfModule.config.mongooseId];
  var License = mongoose.model('License');
  var XiconfResult = mongoose.model('XiconfResult');

  var srcIp = req.socket.remoteAddress;
  var zipFileHash = crypto.createHash('md5')
    .update(uuid)
    .update(Math.random().toString())
    .digest('hex');
  var zipFileName = Math.round(Date.now() / 1000).toString() + '@' + srcIp + '@' + zipFileHash;
  var zipFilePath = path.join(xiconfModule.config.zipStoragePath, zipFileName);

  step(
    function()
    {
      var fifteenMinutesAgo = moment().subtract(15, 'minutes').toDate();

      License.findById(uuid, {appId: 1})
        .lean()
        .exec(this.parallel());

      XiconfResult.distinct('srcIp', {startedAt: {$gte: fifteenMinutesAgo}, srcUuid: uuid})
        .lean()
        .exec(this.parallel());
    },
    function(err, license, srcIps)
    {
      if (err)
      {
        return this.done(next, err);
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

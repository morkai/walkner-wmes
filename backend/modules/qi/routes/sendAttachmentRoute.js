// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const step = require('h5.step');
const contentDisposition = require('content-disposition');
const gm = require('gm');

module.exports = function sendAttachmentRoute(app, qiModule, req, res, next)
{
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  const fields = {};
  let attachmentProperty = req.params.attachment;

  if (/NOK$/.test(attachmentProperty))
  {
    attachmentProperty = 'nokFile';
  }
  else if (/OK$/.test(attachmentProperty))
  {
    attachmentProperty = 'okFile';
  }

  fields[attachmentProperty] = 1;

  step(
    function findResultStep()
    {
      QiResult.findById(req.params.result, fields).lean().exec(this.next());
    },
    function handleFindResultResultStep(err, qiResult)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!qiResult)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      this.attachment = qiResult[attachmentProperty];

      if (!this.attachment)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      if (!req.query.min
        || !/^image/.test(this.attachment.type)
        || this.attachment.size < 512000)
      {
        return this.skip(null, false);
      }
    },
    function findMinFileStep()
    {
      fs.stat(path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg'), this.next());
    },
    function createMinFileStep(err)
    {
      if (!err)
      {
        return this.skip(null, true);
      }

      gm(path.join(qiModule.config.attachmentsDest, this.attachment.path))
        .resize(1200, null, '>')
        .write(path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg'), this.next());
    },
    function handleCreateMinFileResultStep(err)
    {
      if (!err)
      {
        return this.skip(null, true);
      }

      qiModule.error(
        "Failed to generate a min image of [%s] of [%s]: %s",
        attachmentProperty,
        req.params.result,
        err.message
      );

      return this.skip(null, false);
    },
    function sendAttachmentStep(err, min)
    {
      if (err)
      {
        return next(err);
      }

      let fileType;
      let filePath;

      if (min)
      {
        fileType = 'image/jpeg';
        filePath = path.join(qiModule.config.attachmentsDest, this.attachment.path + '.min.jpg');
      }
      else
      {
        fileType = this.attachment.type;
        filePath = path.join(qiModule.config.attachmentsDest, this.attachment.path);
      }

      res.type(fileType);
      res.append('Content-Disposition', contentDisposition(this.attachment.name, {
        type: req.query.download ? 'attachment' : 'inline'
      }));
      res.sendFile(filePath);

      this.attachment = null;
    }
  );
};

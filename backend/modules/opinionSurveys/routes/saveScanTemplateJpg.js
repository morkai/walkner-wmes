// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');
const gm = require('gm');

module.exports = function saveScanTemplateJpgRoute(app, module, req, res, next)
{
  const express = app[module.config.expressId];

  const file = req.file;
  const imageId = Date.now().toString(36) + Math.round(1000000000 + Math.random() * 8999999999).toString(36);
  const templatePath = path.join(module.config.templatesPath, imageId + '.jpg');

  step(
    function deskewStep()
    {
      if (!file || !/^image/.test(file.mimetype))
      {
        return this.skip(express.createHttpError('INVALID_MIME_TYPE', 400));
      }

      module.deskewImage(file.path, file.path + '.skewed.jpg', this.next());
    },
    function resizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      gm(file.path + '.skewed.jpg')
        .autoOrient()
        .quality(100)
        .resize(1280)
        .noProfile()
        .write(templatePath, this.next());
    },
    function getSizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      gm(templatePath).size(this.next());
    },
    function finalizeStep(err, size)
    {
      if (err)
      {
        fs.unlink(templatePath, _.noop);

        next(err);
      }
      else
      {
        res.json({
          image: imageId,
          width: size.width,
          height: size.height
        });
      }

      if (file)
      {
        fs.unlink(file.path, _.noop);
        fs.unlink(file.path + '.skewed.jpg', _.noop);
      }
    }
  );
};

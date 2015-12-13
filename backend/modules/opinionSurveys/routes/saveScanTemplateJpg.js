// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');
var gm = require('gm');

module.exports = function saveScanTemplateJpgRoute(app, module, req, res, next)
{
  var express = app[module.config.expressId];

  var file = req.file;
  var imageId = Date.now().toString(36) + Math.round(1000000000 + Math.random() * 8999999999).toString(36);
  var templatePath = path.join(module.config.templatesPath, imageId + '.jpg');

  step(
    function deskewStep()
    {
      if (!file || !/^image/.test(file.mimetype))
      {
        return this.skip(express.createHttpError('INVALID_MIME_TYPE', 400));
      }

      module.deskewImage(file.path, file.path, this.next());
    },
    function resizeStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      gm(file.path)
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
      }
    }
  );
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs-extra');
const step = require('h5.step');
const gm = require('gm');

module.exports = function uploadContainerImageRoute(app, module, req, res, next)
{
  step(
    function()
    {
      gm(req.file.path)
        .resize(1920, 1080, '>')
        .write(path.join(module.config.containerImagesDest, req.file.filename + '.jpg'), this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      fs.unlink(req.file.path, () => {});

      res.json(req.file.filename);
    }
  );
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const step = require('h5.step');
const contentDisposition = require('content-disposition');

module.exports = function sendContainerImageRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanContainer = mongoose.model('KanbanContainer');

  step(
    function()
    {
      KanbanContainer.findById(req.params.id, {image: 1}).lean().exec(this.next());
    },
    function(err, container)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!container)
      {
        return this.skip(app.createError('Container not found.', 'NOT_FOUND', 404));
      }

      if (!container.image)
      {
        return this.skip(app.createError('Image not assigned.', 'NOT_FOUND', 404));
      }

      this.filePath = path.join(module.config.containerImagesDest, container.image + '.jpg');
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.type('image/jpeg');
      res.append('Content-Disposition', contentDisposition(req.params.id + '.jpg', {
        type: 'inline'
      }));
      res.sendFile(this.filePath);
    }
  );
};

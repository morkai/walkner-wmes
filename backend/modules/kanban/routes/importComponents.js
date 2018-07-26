// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const xlsx = require('xlsx');
const fs = require('fs-extra');

module.exports = function importComponentsRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const KanbanComponent = mongoose.model('KanbanComponent');

  step(
    function()
    {
      console.log(req.file);
      return this.skip(app.createError('TODO'));

      try
      {
        this.xlsx = xlsx.readFile(req.file);
      }
      catch (err)
      {
        this.skip(err);
      }
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    }
  );
};

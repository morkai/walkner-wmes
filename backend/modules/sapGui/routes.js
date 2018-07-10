// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function setUpSapGuiRoutes(app, module)
{
  const express = app[module.config.expressId];

  let remoteJobCounter = 0;

  express.options('/sapGui/jobs;run', (req, res) =>
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
  });

  express.post('/sapGui/jobs;run', runJobRoute);

  function runJobRoute(req, res, next)
  {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.body.secretKey !== module.config.secretKey)
    {
      return next(app.createError('Invalid secret key.', 'INPUT', 401));
    }

    const job = req.body.job || {};

    if (!_.isPlainObject(job) || _.isEmpty(job))
    {
      return next(app.createError('Invalid job definition.', 'INPUT'));
    }

    job.key = `remote#${++remoteJobCounter}`;

    module.runJob(job, (err, exitCode, output) =>
    {
      if (err)
      {
        return next(err);
      }

      res.json(output);
    });
  }
};
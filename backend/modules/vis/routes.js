// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpVisRoutes(app, module)
{
  const express = app[module.config.expressId];
  const auth = app[module.config.userId].auth;
  const mongoose = app[module.config.mongooseId];

  const VisNodePosition = mongoose.model('VisNodePosition');

  const canView = auth('REPORTS:VIEW');
  const canManage = auth('REPORTS:MANAGE');

  express.get('/vis/nodePositions', canView, express.crud.browseRoute.bind(null, app, VisNodePosition));

  express.put('/vis/nodePositions/:id', canManage, updateRoute);

  function updateRoute(req, res, next)
  {
    const nodePosition = {
      _id: req.params.id,
      x: req.body.x,
      y: req.body.y
    };

    if (nodePosition.x === null && nodePosition.y === null)
    {
      return deleteRoute(nodePosition, res, next);
    }

    if (typeof nodePosition.x !== 'number' || typeof nodePosition.y !== 'number')
    {
      return next(app.createError('INVALID_POSITION', 400));
    }

    const conditions = {
      _id: req.params.id
    };
    const update = {
      $set: {
        x: req.body.x,
        y: req.body.y
      }
    };

    VisNodePosition.collection.update(conditions, update, {upsert: true}, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.json(nodePosition);

      app.broker.publish('vis.nodePositions.updated', nodePosition);
    });
  }

  function deleteRoute(nodePosition, res, next)
  {
    VisNodePosition.collection.remove({_id: nodePosition._id}, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.json(nodePosition);

      app.broker.publish('vis.nodePositions.updated', nodePosition);
    });
  }
};

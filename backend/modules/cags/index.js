// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  planUploadPath: './'
};

exports.start = function startCagsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('cagGroups.added', onCagGroupChanged);
  app.broker.subscribe('cagGroups.edited', onCagGroupChanged);

  function onCagGroupChanged(message)
  {
    const mongoose = app[module.config.mongooseId];

    if (!mongoose)
    {
      return;
    }

    const CagGroup = mongoose.model('CagGroup');
    const conditions = {
      _id: {
        $ne: message.model._id
      }
    };
    const update = {
      $pullAll: {
        cags: message.model.cags
      }
    };

    CagGroup.updateMany(conditions, update, err =>
    {
      if (err)
      {
        module.error('Failed to update CAGs in groups: %s', err.message);
      }
    });
  }
};

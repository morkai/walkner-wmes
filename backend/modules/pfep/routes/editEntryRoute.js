// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function editResultRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const PfepEntry = mongoose.model('PfepEntry');

  const user = req.session.user;
  const input = req.body;

  const updater = userModule.createUserInfo(user, req);
  updater.id = updater.id.toString();

  step(
    function findEntryStep()
    {
      PfepEntry.findById(req.params.id).exec(this.next());
    },
    function applyChangesStep(err, entry)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!entry)
      {
        return this.skip(app.createError('NOT_FOUND', 404));
      }

      const changed = entry.applyChanges(input, updater);

      if (changed)
      {
        entry.save(this.next());
      }
    },
    function sendResponseStep(err, entry)
    {
      if (err)
      {
        return next(err);
      }

      if (entry)
      {
        res.json(entry);

        app.broker.publish('pfep.entries.edited', {
          model: entry,
          user: updater
        });
      }
      else
      {
        res.json({_id: req.params.id});
      }
    }
  );
};

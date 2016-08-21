// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const later = require('later');

module.exports = function setUpObserverCleaner(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const D8Entry = mongoose.model('D8Entry');

  app.broker.subscribe('app.started', cleanUpObservers).setLimit(1);

  later.setInterval(cleanUpObservers, later.parse.text('at 00:16 of every day'));

  function cleanUpObservers()
  {
    step(
      function()
      {
        const conditions = {
          status: 'closed',
          updatedAt: {
            $lt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
          },
          'observers.notify': true
        };

        D8Entry.find(conditions, {observers: 1}).lean().exec(this.next());
      },
      function(err, entries)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < entries.length; ++i)
        {
          const entry = entries[i];
          const observers = entry.observers;

          for (let ii = 0; ii < observers.length; ++ii)
          {
            const observer = observers[ii];

            observer.notify = false;
            observer.changes = {};
          }

          D8Entry.collection.update(
            {_id: entry._id},
            {$set: {observers: observers}},
            this.group()
          );
        }
      },
      function(err)
      {
        if (err)
        {
          module.error("Failed to clean observers: %s", err.message);
        }
      }
    );
  }
};

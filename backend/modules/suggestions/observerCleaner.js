// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const later = require('later');

module.exports = function setUpObserverCleaner(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const Suggestion = mongoose.model('Suggestion');

  app.broker.subscribe('app.started', cleanUpObservers).setLimit(1);

  later.setInterval(cleanUpObservers, later.parse.text('at 00:15 of every day'));

  function cleanUpObservers()
  {
    step(
      function()
      {
        const conditions = {
          status: {$in: ['finished', 'cancelled']},
          updatedAt: {
            $lt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
          },
          'observers.notify': true
        };

        Suggestion.find(conditions, {observers: 1}).lean().exec(this.next());
      },
      function(err, suggestions)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (let i = 0; i < suggestions.length; ++i)
        {
          const suggestion = suggestions[i];
          const observers = suggestion.observers;

          for (let ii = 0; ii < observers.length; ++ii)
          {
            const observer = observers[ii];

            observer.notify = false;
            observer.changes = {};
          }

          Suggestion.collection.update(
            {_id: suggestion._id},
            {$set: {observers: observers}},
            this.group()
          );
        }
      },
      function(err)
      {
        if (err)
        {
          module.error('Failed to clean observers: %s', err.message);
        }
      }
    );
  }
};

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var later = require('later');

module.exports = function setUpObserverCleaner(app, module)
{
  var mongoose = app[module.config.mongooseId];
  var Suggestion = mongoose.model('Suggestion');

  app.broker.subscribe('app.started', cleanUpObservers).setLimit(1);

  later.setInterval(cleanUpObservers, later.parse.text('at 00:15 of every day'));

  function cleanUpObservers()
  {
    step(
      function()
      {
        var conditions = {
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

        for (var i = 0; i < suggestions.length; ++i)
        {
          var suggestion = suggestions[i];
          var observers = suggestion.observers;

          for (var ii = 0; ii < observers.length; ++ii)
          {
            var observer = observers[ii];

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
          module.error("Failed to clean observers: %s", err.message);
        }
      }
    );
  }
};

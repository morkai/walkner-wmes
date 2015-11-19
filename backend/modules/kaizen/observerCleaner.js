// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');
var later = require('later');

module.exports = function setUpObserverCleaner(app, module)
{
  var mongoose = app[module.config.mongooseId];
  var KaizenOrder = mongoose.model('KaizenOrder');

  app.broker.subscribe('app.started', cleanUpObservers).setLimit(1);

  later.setInterval(cleanUpObservers, later.parse.text('at 00:10 of every day'));

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

        KaizenOrder.find(conditions, {observers: 1}).lean().exec(this.next());
      },
      function(err, kaizenOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        for (var i = 0; i < kaizenOrders.length; ++i)
        {
          var kaizenOrder = kaizenOrders[i];
          var observers = kaizenOrder.observers;

          for (var ii = 0; ii < observers.length; ++ii)
          {
            var observer = observers[ii];

            observer.notify = false;
            observer.changes = {};
          }

          KaizenOrder.collection.update(
            {_id: kaizenOrder._id},
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

// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  productionModule.getProdData('shift', logEntry.prodShift, function(err, prodShift)
  {
    if (err)
    {
      productionModule.error(
        "Failed to get a prod shift [%s] to set the next order (LOG=[%s]): %s",
        logEntry.prodShift,
        logEntry._id,
        err.stack
      );

      return done(err);
    }

    if (!prodShift)
    {
      productionModule.warn(
        "Couldn't find prod shift [%s] to set the next order (LOG=[%s])",
        logEntry.prodShift,
        logEntry._id
      );

      return done();
    }

    prodShift.nextOrder = !logEntry.data.orderNo || !logEntry.data.operationNo
      ? null
      : _.pick(logEntry.data, ['orderNo', 'operationNo']);

    prodShift.save(function(err)
    {
      if (err)
      {
        productionModule.error(
          "Failed to save prod shift [%s] after setting the next order (LOG=[%s]): %s",
          logEntry.prodShift,
          logEntry._id,
          err.stack
        );
      }

      return done(err);
    });
  });
};

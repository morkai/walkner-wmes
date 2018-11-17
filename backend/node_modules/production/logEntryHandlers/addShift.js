// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShift = mongoose.model('ProdShift');

  const prodShift = new ProdShift(logEntry.data);

  prodShift.save(function(err)
  {
    if (err)
    {
      productionModule.error(
        'Failed to save a new shift [%s] (LOG=[%s]): %s',
        logEntry.data._id,
        logEntry._id,
        err.stack
      );
    }

    return done(err);
  });
};

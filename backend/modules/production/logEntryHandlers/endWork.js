'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  if (prodLine.isNew)
  {
    return done();
  }

  prodLine.set({
    prodShiftOrder: null,
    prodDowntime: null
  });

  prodLine.save(function(err)
  {
    if (err)
    {
      productionModule.error(
        "Failed to save the prod line after ending the work (LOG=[%s]): %s",
        logEntry._id,
        err.stack
      );
    }

    return done(err);
  });
};

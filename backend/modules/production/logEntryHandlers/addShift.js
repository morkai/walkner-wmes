// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var mongoose = app[productionModule.config.mongooseId];
  var ProdShift = mongoose.model('ProdShift');

  var prodShift = new ProdShift(logEntry.data);

  prodShift.save(function(err)
  {
    if (err)
    {
      productionModule.error(
        "Failed to save a new shift [%s] (LOG=[%s]): %s",
        logEntry.data._id,
        logEntry._id,
        err.stack
      );
    }

    return done(err);
  });
};

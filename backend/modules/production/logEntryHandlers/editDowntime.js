// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var step = require('h5.step');

module.exports = function(app, productionModule, prodLine, logEntry, done)
{
  var changes = logEntry.data;

  step(
    function getModelsStep()
    {
      productionModule.getProdData('downtime', logEntry.data._id, this.next());
    },
    function updateModelsStep(err, prodDowntime)
    {
      if (err)
      {
        productionModule.error(
          "Failed to find downtime [%s] to edit (LOG=[%s]): %s",
          logEntry.data._id,
          logEntry._id,
          err.stack
        );

        return this.skip(err);
      }

      delete changes._id;

      prodDowntime.set(changes);
      prodDowntime.save(this.parallel());
    },
    done
  );
};

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
        return this.skip(err);
      }

      delete changes._id;

      prodDowntime.set(changes);
      prodDowntime.save(this.parallel());
    },
    done
  );
};

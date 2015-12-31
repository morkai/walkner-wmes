// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

module.exports = function getPlannedQuantitiesCommand(app, productionModule, socket, prodShiftId, reply)
{
  if (!_.isFunction(reply))
  {
    return;
  }

  productionModule.getProdData('shift', prodShiftId, function(err, prodShift)
  {
    if (err)
    {
      return reply(err);
    }

    if (!prodShift)
    {
      return reply(new Error('UNKNOWN_PROD_SHIFT'));
    }

    var plannedQuantities = prodShift.quantitiesDone.map(function(quantityDone)
    {
      return quantityDone.planned;
    });

    reply(null, plannedQuantities);
  });
};

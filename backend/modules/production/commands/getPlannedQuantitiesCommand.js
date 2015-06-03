// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

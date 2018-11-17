// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');

const PERSONNEL_TYPES = {
  master: 1,
  leader: 1,
  operator: 1
};

module.exports = function getRecentPersonnelRoute(app, productionModule, req, res, next)
{
  if (!PERSONNEL_TYPES[req.query.type])
  {
    return next(app.createError('UNKNOWN_TYPE'));
  }

  const orgUnits = app[productionModule.config.orgUnitsId];
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShift = mongoose.model('ProdShift');

  const pipeline = [
    {$match: {
      prodLine: orgUnits.fix.prodLine(req.query.prodLine),
      date: {$gte: moment().subtract(14, 'days').toDate()},
      shift: parseInt(req.query.shift, 10)
    }},
    {$group: {_id: `$${req.query.type}.id`, label: {$max: `$${req.query.type}.label`}, count: {$sum: 1}}},
    {$match: {_id: {$ne: null}}},
    {$sort: {count: -1}},
    {$limit: 5}
  ];

  ProdShift.aggregate(pipeline, function(err, results)
  {
    if (err)
    {
      return next(err);
    }

    res.json(results);
  });
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function findByRidRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const PfepEntry = mongoose.model('PfepEntry');

  const rid = parseInt(req.query.rid, 10);

  if (isNaN(rid) || rid <= 0)
  {
    return res.sendStatus(400);
  }

  PfepEntry.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, entry)
  {
    if (err)
    {
      return next(err);
    }

    if (entry)
    {
      return res.json(entry._id);
    }

    return res.sendStatus(404);
  });
};

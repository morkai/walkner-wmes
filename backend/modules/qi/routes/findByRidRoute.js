// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function findByRidRoute(app, qiModule, req, res, next)
{
  const mongoose = app[qiModule.config.mongooseId];
  const QiResult = mongoose.model('QiResult');

  const rid = parseInt(req.query.rid, 10);

  if (isNaN(rid) || rid <= 0)
  {
    return res.sendStatus(400);
  }

  QiResult.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, qiResult)
  {
    if (err)
    {
      return next(err);
    }

    if (qiResult)
    {
      return res.json(qiResult._id);
    }

    return res.sendStatus(404);
  });
};

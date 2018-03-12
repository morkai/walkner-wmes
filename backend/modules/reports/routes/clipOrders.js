// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function clipOrdersRoute(app, reportsModule, req, res, next)
{
  const ClipOrderCache = app[reportsModule.config.mongooseId].model('ClipOrderCache');

  const {hash, count} = req.query;

  if (typeof hash !== 'string' || !/^[a-f0-9]{32}$/.test(hash))
  {
    return res.json({
      totalCount: 0,
      collection: []
    });
  }

  ClipOrderCache
    .find({'_id.hash': hash})
    .sort({'_id.hash': 1, '_id.startDate': 1})
    .limit(req.rql.limit)
    .skip(req.rql.skip)
    .lean()
    .exec((err, docs) =>
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: parseInt(count, 10) || 0,
        collection: docs
      });
    });
};

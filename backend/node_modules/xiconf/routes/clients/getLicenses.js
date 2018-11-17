// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function getLicensesRoute(app, xiconfModule, req, res, next)
{
  const mongoose = app[xiconfModule.config.mongooseId];
  const License = mongoose.model('License');
  const XiconfClient = mongoose.model('XiconfClient');

  License.find({appId: 'walkner-xiconf'}).lean().exec(function(err, licenses)
  {
    if (err)
    {
      return next(err);
    }

    if (!req.query.free)
    {
      return res.json({
        totalCount: licenses.length,
        collection: licenses
      });
    }

    XiconfClient.find({}, {license: 1}).lean().exec(function(err, clients)
    {
      if (err)
      {
        return next(err);
      }

      const usedLicenses = {};

      clients.forEach(client => usedLicenses[client.license] = true);

      const freeLicenses = licenses.filter(license => !usedLicenses[license._id]);

      res.json({
        totalCount: freeLicenses.length,
        collection: freeLicenses
      });
    });
  });
};

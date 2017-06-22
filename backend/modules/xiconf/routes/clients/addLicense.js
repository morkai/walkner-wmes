// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const uuid = require('uuid/v4');
const moment = require('moment');

module.exports = function getLicensesRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const licensesModule = app[module.config.licensesId];
  const mongoose = app[module.config.mongooseId];
  const License = mongoose.model('License');

  const features = parseInt(req.body.features, 10);

  if (isNaN(features) || features <= 0)
  {
    return next(app.createError('INVALID_FEATURES', 400));
  }

  const license = new License({
    _id: uuid().toUpperCase(),
    appId: 'walkner-xiconf',
    appVersion: '2.x',
    date: moment().startOf('day').toDate(),
    licensee: licensesModule.config.defaultLicensee,
    features: features,
    key: '',
    expireDate: null
  });

  license.key = licensesModule.generateLicenseKey(license);

  license.save(function(err)
  {
    if (err)
    {
      return next(err);
    }

    res.json(license);

    app.broker.publish('licenses.added', {
      user: userModule.createUserInfo(req.session.user, req),
      model: license
    });
  });
};

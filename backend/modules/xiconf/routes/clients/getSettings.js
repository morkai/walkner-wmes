// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function getSettingsRoute(app, xiconfModule, req, res, next)
{
  const XiconfClientSettings = app[xiconfModule.config.mongooseId].model('XiconfClientSettings');

  const _id = req.query._id;

  if (!_.isString(_id) || !_id.length)
  {
    return next(app.createError('INPUT', 400));
  }

  if (_.isEmpty(req.body.licenseKey) || req.query.force)
  {
    XiconfClientSettings.findOne({_id: _id}).sort({updatedAt: -1}).exec(function(err, settings)
    {
      if (err)
      {
        return next(err);
      }

      return res.json(settings ? settings.settings : {});
    });
  }
  else
  {
    const update = {
      $set: {
        updatedAt: new Date(),
        settings: req.body
      }
    };

    XiconfClientSettings.update({_id: _id}, update, {upsert: true}, function(err)
    {
      if (err)
      {
        return next(err);
      }

      return res.json({});
    });
  }
};

'use strict';

var step = require('h5.step');
var userInfo = require('../../models/userInfo');
var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio'
};

exports.start = function startSettingsModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoosem module is required!");
  }

  var Setting = mongoose.model('Setting');

  app.onModuleReady(module.config.expressId, setUpRoutes.bind(null, app, module));

  module.Setting = Setting;

  module.findById = function(_id, done)
  {
    module.find({_id: _id}, function(err, docs)
    {
      done(err, Array.isArray(docs) && docs.length ? docs[0] : null);
    });
  };

  module.find = function(conditions, done)
  {
    Setting.find(conditions, {value: 1}).lean().exec(done);
  };

  module.update = function(_id, newValue, updater, done)
  {
    var updatedAt = new Date();
    var update = {
      $set: {
        value: newValue,
        updater: updater,
        updatedAt: updatedAt
      }
    };

    Setting.update({_id: _id}, update, {upsert: true}, function(err)
    {
      if (err)
      {
        module.error("Failed to set the [%s] setting to [%s]: %s", _id, newValue, err.stack);
      }
      else
      {
        update.$set._id = _id;

        app.broker.publish('settings.updated.' + _id, {
          _id: _id,
          value: newValue,
          updater: updater,
          updatedAt: updatedAt
        });
      }

      done(err);
    });
  };

  module.multiUpdate = function(settings, updater, done)
  {
    step(
      function updateSettingsStep()
      {
        var step = this;

        settings.forEach(function(_id)
        {
          module.update(_id, settings[_id], updater, step.parallel());
        });
      },
      done
    );
  };

  module.updateRoute = function(req, res, next)
  {
    if (typeof req.body._id !== 'string' || req.body._id.trim().length === 0)
    {
      return next(new Error('INVALID_ID'));
    }

    if (req.body.value === undefined)
    {
      return next(new Error('MISSING_VALUE'));
    }

    module.update(
      req.body._id,
      req.body.value,
      userInfo.createObject(req.session.user, req),
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.send(204);
      }
    );
  };
};

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user'
};

exports.start = function startSettingsModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('mongoose module is required!');
  }

  const Setting = mongoose.model('Setting');

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

  module.findValues = function(conditions, ns, done)
  {
    if (typeof conditions === 'string' && typeof ns === 'function')
    {
      done = ns;
      ns = conditions;
      conditions = {_id: new RegExp('^' + _.escapeRegExp(ns))};
    }

    module.find(conditions, function(err, settings)
    {
      if (err)
      {
        return done(err, null);
      }

      const result = {};

      for (let i = 0, l = settings.length; i < l; ++i)
      {
        const setting = settings[i];

        result[setting._id.replace(ns, '')] = setting.value;
      }

      done(null, result);
    });
  };

  module.update = function(_id, newValue, updater, done)
  {
    const updatedAt = new Date();
    const update = {
      $set: {
        value: newValue,
        updater: updater,
        updatedAt: updatedAt
      }
    };

    Setting.updateOne({_id: _id}, update, {upsert: true}, function(err)
    {
      if (err)
      {
        module.error('Failed to set the [%s] setting to [%s]: %s', _id, newValue, err.stack);
      }
      else
      {
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
        const step = this;

        _.forEach(settings, function(_id)
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

    const userModule = app[module.config.userId];

    module.update(
      req.body._id,
      req.body.value,
      userModule ? userModule.createUserInfo(req.session.user, req) : null,
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.sendStatus(204);
      }
    );
  };
};

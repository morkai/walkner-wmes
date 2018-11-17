// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function sendDictionariesRoute(app, module, req, res, next)
{
  const settings = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];

  const results = {};

  step(
    function findSettingsStep()
    {
      settings.find({_id: /^opinionSurveys/}, this.next());
    },
    function handleFindSettingsResultStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      results.settings = settings;
    },
    function findDictionariesStep()
    {
      const step = this;

      _.forEach(module.DICTIONARIES, function(modelName)
      {
        mongoose.model(modelName).find().lean().exec(step.group());
      });
    },
    function sendResultStep(err, dictionaries)
    {
      if (err)
      {
        return next(err);
      }

      _.forEach(Object.keys(module.DICTIONARIES), function(dictionaryName, i)
      {
        results[dictionaryName] = dictionaries[i];
      });

      res.json(results);
    }
  );
};

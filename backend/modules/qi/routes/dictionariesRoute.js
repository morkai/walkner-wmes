// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function dictionariesRoute(app, qiModule, req, res, next)
{
  const settings = app[qiModule.config.settingsId];
  const mongoose = app[qiModule.config.mongooseId];
  const User = mongoose.model('User');
  const QiResult = mongoose.model('QiResult');

  step(
    function findStep()
    {
      _.forEach(qiModule.DICTIONARIES, modelName =>
      {
        mongoose.model(modelName).find().lean().exec(this.group());
      });

      QiResult
        .distinct('productFamily', this.group());

      User
        .find({privileges: 'QI:INSPECTOR'}, {login: 1, firstName: 1, lastName: 1})
        .sort({searchName: 1})
        .lean()
        .exec(this.group());

      User
        .find({prodFunction: 'master'}, {login: 1, firstName: 1, lastName: 1})
        .sort({searchName: 1})
        .lean()
        .exec(this.group());

      User
        .find({prodFunction: 'leader'}, {login: 1, firstName: 1, lastName: 1})
        .sort({searchName: 1})
        .lean()
        .exec(this.group());

      settings
        .find({_id: /^qi/}, this.group());

      qiModule.getActualCountForUser(req.session.user._id, this.group());
    },
    function sendResultStep(err, dictionaries)
    {
      if (err)
      {
        return this.done(next, err);
      }

      const actualCount = dictionaries.pop();
      const settings = dictionaries.pop();
      const result = {
        settings: settings,
        leaders: dictionaries.pop(),
        masters: dictionaries.pop(),
        inspectors: dictionaries.pop(),
        counter: {
          actual: actualCount,
          required: (settings.find(s => s._id === 'qi.requiredCount') || {value: 0}).value
        },
        productFamilies: dictionaries.pop()
      };

      _.forEach(Object.keys(qiModule.DICTIONARIES), function(dictionaryName, i)
      {
        result[dictionaryName] = dictionaries[i];
      });

      res.json(result);
    }
  );
};

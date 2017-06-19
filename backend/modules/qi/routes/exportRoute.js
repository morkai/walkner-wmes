// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

exports.fetchDictionaries = function(app, qiModule, req, res, next)
{
  const mongoose = app[qiModule.config.mongooseId];

  req.qiDictionaries = {
    maxActionCount: 1
  };

  step(
    function findStep()
    {
      const pipeline = [
        {$match: mongoSerializer.fromQuery(req.rql).selector},
        {$project: {count: {$size: '$correctiveActions'}}},
        {$group: {_id: null, count: {$max: '$count'}}}
      ];

      mongoose.model('QiResult').aggregate(pipeline, this.group());

      _.forEach(qiModule.DICTIONARIES, modelName =>
      {
        mongoose.model(modelName)
          .find({}, {name: 1})
          .lean()
          .exec(this.group());
      });
    },
    function sendResultStep(err, dictionaries)
    {
      if (err)
      {
        return next(err);
      }

      const actionCountResults = dictionaries.shift();
      const maxActionCount = Array.isArray(actionCountResults) && actionCountResults.length
        ? actionCountResults[0].count
        : 0;

      if (maxActionCount > 1)
      {
        req.qiDictionaries.maxActionCount = maxActionCount;
      }

      _.forEach(Object.keys(qiModule.DICTIONARIES), function(dictionaryName, i)
      {
        req.qiDictionaries[dictionaryName] = {};

        _.forEach(dictionaries[i], function(dictionaryModel)
        {
          req.qiDictionaries[dictionaryName][dictionaryModel._id] = dictionaryModel.name;
        });
      });

      setImmediate(next);
    }
  );
};

exports.serializeRow = function(app, qiModule, doc, req)
{
  var dict = req.qiDictionaries;
  var kind = dict.kinds[doc.kind];
  var errorCategory = dict.errorCategories[doc.errorCategory];
  var row = {
    '#rid': doc.rid,
    '"12nc': doc.nc12,
    '"productName': doc.productName,
    '"division': doc.division,
    '"productFamily': doc.productFamily,
    '"orderNo': doc.orderNo,
    'inspectedAt': app.formatDate(doc.inspectedAt),
    '"inspector': doc.inspector.label,
    '"kind': kind || doc.kind,
    '"result': doc.ok ? 'ok' : 'nok',
    '#qtyOrder': doc.qtyOrder,
    '#qtyInspected': doc.qtyInspected,
    '#qtyNokInspected': doc.qtyNokInspected,
    '#qtyToFix': doc.qtyToFix,
    '#qtyNok': doc.qtyNok,
    '"errorCategory': errorCategory || doc.errorCategory,
    '"faultCode': doc.faultCode || '',
    '"faultClassification': doc.faultDescription || '',
    '"problem': doc.problem || '',
    '"immediateActions': doc.immediateActions || '',
    '"immediateResults': doc.immediateResults || '',
    '"rootCause': doc.rootCause || ''
  };

  for (var i = 0; i < dict.maxActionCount; ++i)
  {
    var action = doc.correctiveActions[i] || {
      who: [],
      what: '',
      when: null,
      status: ''
    };
    var suffix = i + 1;

    row['"actionWho' + suffix] = action.who.map(d => d.label).join(', ');
    row['"actionWhat' + suffix] = action.what;
    row['actionWhen' + suffix] = action.when ? app.formatDate(action.when) : '';
    row['"actionStatus' + suffix] = action.status;
  }

  return row;
};

exports.cleanUp = function(req)
{
  req.qiDictionaries = null;
};

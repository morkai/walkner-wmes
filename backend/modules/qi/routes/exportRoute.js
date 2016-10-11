// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

exports.fetchDictionaries = function(app, qiModule, req, res, next)
{
  const mongoose = app[qiModule.config.mongooseId];

  req.qiDictionaries = {};

  step(
    function findStep()
    {
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

  return {
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
};

exports.cleanUp = function(req)
{
  req.qiDictionaries = null;
};

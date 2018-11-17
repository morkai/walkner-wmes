// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const helpers = require('./helpers');
const report6 = require('../report6');

module.exports = function report6Route(app, reportsModule, req, res, next)
{
  const orgUnitsModule = app[reportsModule.config.orgUnitsId];
  const prodTasksModule = app[reportsModule.config.prodTasksId];

  const options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'shift',
    prodTasks: null,
    settings: {}
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  step(
    function getSettingsStep()
    {
      app[reportsModule.config.settingsId].findValues({_id: /^reports\.wh\./}, 'reports.wh.', this.next());
    },
    function generateReportStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      const compSubdivision = orgUnitsModule.getByTypeAndId('subdivision', settings['comp.id']);
      const finGoodsSubdivision = orgUnitsModule.getByTypeAndId('subdivision', settings['finGoods.id']);

      options.prodTasks = prepareProdTasks(
        prodTasksModule.models,
        (compSubdivision ? compSubdivision.prodTaskTags : null) || [],
        (finGoodsSubdivision ? finGoodsSubdivision.prodTaskTags : null) || []
      );
      options.settings = settings;

      helpers.generateReport(app, reportsModule, report6, '6', req.reportHash, options, this.next());
    },
    function sendResultStep(err, reportJson)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.send(reportJson);
    }
  );
};

function prepareProdTasks(prodTasksList, compTags, finGoodsTags)
{
  const prodTasksMap = {};

  _.forEach(prodTasksList, function(prodTask)
  {
    const inComp = _.intersection(prodTask.tags, compTags).length > 0;
    const inFinGoods = _.intersection(prodTask.tags, finGoodsTags).length > 0;

    if (!inComp && !inFinGoods)
    {
      return;
    }

    prodTasksMap[prodTask._id] = {
      name: prodTask.name,
      color: prodTask.clipColor,
      parent: prodTask.parent,
      inComp: inComp,
      inFinGoods: inFinGoods
    };
  });

  return prodTasksMap;
}

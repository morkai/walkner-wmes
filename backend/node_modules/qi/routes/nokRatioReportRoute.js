// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const nokRatioReport = require('../nokRatioReport');

module.exports = function okRatioReportRoute(app, qiModule, req, res, next)
{
  const reportsModule = app[qiModule.config.reportsId];
  const orgUnitsModule = app[qiModule.config.orgUnitsId];

  const query = req.query;
  const fromTime = reportsModule.helpers.getTime(query.from) || null;
  const options = {
    interval: 'month',
    fromTime: reportsModule.helpers.getTime(query.from) || null,
    toTime: reportsModule.helpers.getTime(query.to) || null,
    kinds: _.isEmpty(query.kinds) ? [] : query.kinds.split(','),
    divisions: orgUnitsModule.getAllByType('division')
      .filter(d => !d.deactivatedAt || !fromTime || fromTime < d.deactivatedAt)
      .map(d => d.toJSON())
  };

  reportsModule.helpers.generateReport(
    app,
    reportsModule,
    nokRatioReport,
    'qi/nokRatio',
    req.reportHash,
    options,
    function(err, reportJson)
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

// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const nokRatioReport = require('../nokRatioReport');

module.exports = function okRatioReportRoute(app, qiModule, req, res, next)
{
  const reportsModule = app[qiModule.config.reportsId];
  const orgUnitsModule = app[qiModule.config.orgUnitsId];

  const query = req.query;
  const options = {
    interval: 'month',
    fromTime: reportsModule.helpers.getTime(query.from) || null,
    toTime: reportsModule.helpers.getTime(query.to) || null,
    divisions: orgUnitsModule.getAllByType('division').map(d => d.toJSON())
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

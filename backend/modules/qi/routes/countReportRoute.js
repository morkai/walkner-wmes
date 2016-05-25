// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const countReport = require('../countReport');

module.exports = function countReportRoute(app, qiModule, req, res, next)
{
  const reportsModule = app[qiModule.config.reportsId];

  const query = req.query;
  const options = {
    fromTime: reportsModule.helpers.getTime(query.from) || null,
    toTime: reportsModule.helpers.getTime(query.to) || null,
    interval: reportsModule.helpers.getInterval(query.interval),
    productFamilies: _.isEmpty(query.productFamilies) ? '' : query.productFamilies,
    kinds: _.isEmpty(query.kinds) ? [] : query.kinds.split(','),
    errorCategories: _.isEmpty(query.errorCategories) ? [] : query.errorCategories.split(','),
    faultCodes: _.isEmpty(query.faultCodes) ? [] : query.faultCodes.split(','),
    inspector: query.inspector || null
  };

  reportsModule.helpers.generateReport(
    app,
    reportsModule,
    countReport,
    'qi/count',
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

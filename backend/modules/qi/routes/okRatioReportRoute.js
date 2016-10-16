// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const okRatioReport = require('../okRatioReport');

module.exports = function okRatioReportRoute(app, qiModule, req, res, next)
{
  const reportsModule = app[qiModule.config.reportsId];
  const orgUnitsModule = app[qiModule.config.orgUnitsId];
  const settingsModule = app[qiModule.config.settingsId];

  const query = req.query;
  const options = {
    interval: 'month',
    fromTime: reportsModule.helpers.getTime(query.from) || null,
    toTime: reportsModule.helpers.getTime(query.to) || null,
    divisions: orgUnitsModule.getAllByType('division').map(d => d.toJSON()),
    whQty: null
  };

  step(
    function()
    {
      settingsModule.findValues({_id: /^qi\.whQty\./}, 'qi.whQty.', this.next());
    },
    function(err, whQty)
    {
      if (err)
      {
        return this.done(next, err);
      }

      options.whQty = whQty;

      reportsModule.helpers.generateReport(
        app,
        reportsModule,
        okRatioReport,
        'qi/okRatio',
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
    }
  );
};

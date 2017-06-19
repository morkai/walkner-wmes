// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var step = require('h5.step');
var moment = require('moment');
var helpers = require('./helpers');
var report9 = require('../report9');

module.exports = function report9Route(app, reportsModule, req, res, next)
{
  var settingsModule = app[reportsModule.config.settingsId];
  var options = {
    fromTime: moment().startOf('month').subtract(6, 'months').valueOf(),
    toTime: moment().startOf('month').valueOf(),
    nc12ToCagsJsonPath: reportsModule.config.nc12ToCagsJsonPath,
    settings: {}
  };

  step(
    function getSettingsStep()
    {
      settingsModule.findValues({_id: /^reports\.cag/}, 'reports.cag.', this.next());
    },
    function generateReportStep(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      options.settings = settings;

      helpers.generateReport(
        app,
        reportsModule,
        report9,
        '9',
        req.reportHash,
        options,
        this.next()
      );
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

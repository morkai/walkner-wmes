// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var report = require('../report');

module.exports = function reportRoute(app, module, req, res, next)
{
  var reportsModule = app[module.config.reportsId];

  var options = {};

  _.forEach(['surveys', 'divisions', 'superiors', 'employers'], function(prop)
  {
    var value = req.query[prop];

    options[prop] = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
  });

  reportsModule.helpers.generateReport(
    app,
    reportsModule,
    report,
    'opinionSurvey',
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

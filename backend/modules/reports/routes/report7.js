// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var helpers = require('./helpers');
var report7 = require('../report7');

module.exports = function report7Route(app, reportsModule, req, res, next)
{
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var query = req.query;
  var options = {
    assemblyMrpControllers: orgUnitsModule.getAssemblyMrpControllersFor(),
    inoutMrpControllers: {},
    statuses: _.isString(query.statuses) && !_.isEmpty(query.statuses) ? query.statuses.split(',') : [],
    aors: _.isString(query.aors) && !_.isEmpty(query.aors) ? query.aors.split(',') : [],
    specificAor: _.isString(query.specificAor) && !_.isEmpty(query.specificAor) ? query.specificAor : null,
    clipFromTime: moment(query.clipFrom, 'YYYY-MM-DD').valueOf(),
    clipToTime: moment(query.clipTo, 'YYYY-MM-DD').valueOf(),
    clipInterval: query.clipInterval || 'day',
    dtFromTime: moment(query.dtcFrom, 'YYYY-MM-DD').hours(6).valueOf(),
    dtToTime: moment(query.dtcTo, 'YYYY-MM-DD').hours(6).valueOf(),
    dtInterval: query.dtcInterval || 'day'
  };

  if (options.specificAor)
  {
    options.aors.push(options.specificAor);
    options.aors = _.uniq(options.aors);
  }

  _.forEach(orgUnitsModule.getAllByType('mrpController'), function(mrpController)
  {
    if (mrpController.inout)
    {
      options.inoutMrpControllers[mrpController._id] = mrpController.inout;
    }
  });

  helpers.generateReport(app, reportsModule, report7, '7', req.reportHash, options, function(err, reportJson)
  {
    if (err)
    {
      return next(err);
    }

    res.type('json');
    res.send(reportJson);
  });
};

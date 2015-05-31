// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var helpers = require('./helpers');
var report7 = require('../report7');

module.exports = function report7Route(app, reportsModule, req, res, next)
{
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];

  var options = {
    assemblyMrpControllers: orgUnitsModule.getAssemblyMrpControllersFor(),
    inoutMrpControllers: {},
    statuses: _.isString(req.query.statuses) && !_.isEmpty(req.query.statuses) ? req.query.statuses.split(',') : [],
    aors: _.isString(req.query.aors) && !_.isEmpty(req.query.aors) ? req.query.aors.split(',') : []
  };

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

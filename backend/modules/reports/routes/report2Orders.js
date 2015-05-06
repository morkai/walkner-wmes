// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var createHash = require('crypto').createHash;
var _ = require('lodash');
var helpers = require('./helpers');

module.exports = function report2OrdersRoute(app, reportsModule, req, res, next)
{
  var query = req.query;
  var fromTime = helpers.getTime(query.from);
  var toTime = helpers.getTime(query.to);

  if (isNaN(fromTime) || isNaN(toTime))
  {
    return res.sendStatus(400);
  }

  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  var mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(query.orgUnitType, query.orgUnitId);

  if (_.isEmpty(mrpControllers))
  {
    return res.json({
      totalCount: 0,
      collection: []
    });
  }

  req.rql.selector.args = [
    {name: 'ge', args: ['startDate', fromTime]},
    {name: 'lt', args: ['startDate', toTime]},
    {name: 'in', args: ['mrp', mrpControllers]}
  ];

  if (_.contains(['all', 'in', 'nin'], query.filter) && _.isString(query.statuses) && /^[A-Z,]+$/.test(query.statuses))
  {
    req.rql.selector.args.push({
      name: query.filter,
      args: ['statuses', query.statuses.split(',')]
    });
  }

  var cacheKey = createHash('md5').update(JSON.stringify(req.rql.selector.args)).digest('hex');

  var browseOptions = {
    model: app[reportsModule.config.mongooseId].model('Order'),
    totalCount: reportsModule.getCachedTotalCount(cacheKey),
    prepareResult: function(totalCount, models, done)
    {
      reportsModule.setCachedTotalCount(cacheKey, totalCount);

      return done(null, {
        totalCount: totalCount,
        collection: models
      });
    }
  };

  app[reportsModule.config.expressId].crud.browseRoute(app, browseOptions, req, res, next);
};

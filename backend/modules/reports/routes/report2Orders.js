// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var createHash = require('crypto').createHash;
var _ = require('lodash');
var moment = require('moment');
var helpers = require('./helpers');

var MAP_REDUCE_CLEAR_DELAY = 10 * 60 * 1000;

module.exports = function report2OrdersRoute(app, reportsModule, req, res, next)
{
  var query = req.query;
  var orgUnitsModule = app[reportsModule.config.orgUnitsId];
  var orgUnit = orgUnitsModule.getByTypeAndId(query.orgUnitType, query.orgUnitId);

  if (orgUnit === null && (query.orgUnitType || query.orgUnitId))
  {
    return res.sendStatus(400);
  }

  var mongoose = app[reportsModule.config.mongooseId];
  var Order = mongoose.model('Order');

  var fromTime = helpers.getTime(query.from);
  var toTime = helpers.getTime(query.to);
  var orderNo = (query.orderNo || '').replace(/[^0-9]+/g, '');
  var hour = parseInt((query.hour || '').replace(/[^0-9]+/g, ''), 10);

  var mrpControllers = orgUnitsModule.getAssemblyMrpControllersFor(query.orgUnitType, query.orgUnitId);

  if (isNaN(hour))
  {
    hour = -1;
  }
  else if (hour >= 24)
  {
    hour = 0;
  }

  if (hour !== -1)
  {
    return findOrdersWithHourFilter();
  }

  return findOrdersWithoutHourFilter();

  function buildStatusSelector(query, selector)
  {
    if (_.contains(['all', 'in', 'nin'], query.filter)
      && _.isString(query.statuses)
      && /^[A-Z,]+$/.test(query.statuses))
    {
      selector.push({
        name: query.filter,
        args: ['statuses', query.statuses.split(',')]
      });
    }
    else if (query.filter === 'wo'
      && _.isString(query.statuses)
      && /^[A-Z,]+$/.test(query.statuses))
    {
      var ors = [];

      _.forEach(query.statuses.split(','), function(status)
      {
        ors.push({name: 'ne', args: ['statuses', status]});
      });

      selector.push({
        name: 'or',
        args: ors
      });
    }
    else if (query.filter === 'red')
    {
      selector.push({
        name: 'or',
        args: [
          {name: 'nin', args: ['statuses', ['CNF', 'PCNF']]},
          {name: 'nin', args: ['statuses', ['DLV', 'PDLV']]}
        ]
      });
    }

    return selector;
  }

  function findOrdersWithoutHourFilter()
  {
    if (orderNo.length < 6)
    {
      if (isNaN(fromTime) || isNaN(toTime))
      {
        return res.sendStatus(400);
      }

      if (_.isEmpty(mrpControllers))
      {
        return res.json({
          totalCount: 0,
          collection: []
        });
      }

      req.rql.selector.args = buildStatusSelector(query, [
        {name: 'ge', args: ['startDate', fromTime]},
        {name: 'lt', args: ['startDate', toTime]},
        {name: 'in', args: ['mrp', mrpControllers]}
      ]);
    }
    else
    {
      req.rql.selector.args = [{
        name: 'regex',
        args: ['_id', '^' + orderNo]
      }];
    }

    var cacheKey = createHash('md5').update(JSON.stringify(req.rql.selector.args)).digest('hex');

    var browseOptions = {
      model: Order,
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
  }

  function findOrdersWithHourFilter()
  {
    /*globals emit,hourMode*/

    var cacheKey = createHash('md5').update(JSON.stringify([
      query.orgUnitType,
      query.orgUnitId,
      fromTime,
      toTime,
      query.filter,
      query.statuses,
      query.hourMode,
      query.hour
    ])).digest('hex');

    if (reportsModule.mapReduceResults[cacheKey])
    {
      return sendCachedMapReduceResults(cacheKey);
    }

    var maxTime = query.hourMode === 'finish'
      ? null
      : moment(toTime).subtract(query.hourMode === 'exclusive' ? 1 : 0, 'days').hours(hour).valueOf();
    var filter = _.isString(query.filter) && orderNo.length < 6 ? query.filter : '';
    var statuses = _.isString(query.statuses)
      ? query.statuses.split(',').filter(function(status) { return status.length > 0; })
      : [];
    var mapReduceQuery = orderNo.length > 6 ? {_id: new RegExp('^' + orderNo)} : {
      mrp: {$in: mrpControllers},
      startDate: {
        $gte: new Date(fromTime),
        $lt: new Date(toTime)
      }
    };

    Order.mapReduce(
      {
        map: function()
        {
          if (hourMode === 'finish')
          {
            this.finishDate.setHours(hour);

            maxTime = this.finishDate.getTime();
          }

          var statusesSetAt = {};
          var changes = this.changes;

          for (var i = 0; i < changes.length; ++i)
          {
            var change = changes[i];

            if (change.time.getTime() > maxTime)
            {
              break;
            }

            var newStatuses = change.newValues.statuses;

            if (!newStatuses)
            {
              continue;
            }

            var newStatusesSetAt = {};

            for (var ii = 0; ii < newStatuses.length; ++ii)
            {
              var newStatus = newStatuses[ii];

              newStatusesSetAt[newStatus] = statusesSetAt[newStatus] || change.time;
            }

            statusesSetAt = newStatusesSetAt;
          }

          var j;
          var found;

          switch (filter)
          {
            case 'red':
              if ((statusesSetAt.CNF || statusesSetAt.PCNF) && (statusesSetAt.DLV || statusesSetAt.PDLV))
              {
                return;
              }
              break;

            case 'all':
              for (j = 0; j < statuses.length; ++j)
              {
                if (!statusesSetAt[statuses[j]])
                {
                  return;
                }
              }
              break;

            case 'in':
            {
              for (j = 0; j < statuses.length; ++j)
              {
                if (statusesSetAt[statuses[j]])
                {
                  found = true;

                  break;
                }
              }

              if (!found)
              {
                return;
              }

              break;
            }

            case 'nin':
            {
              for (j = 0; j < statuses.length; ++j)
              {
                if (statusesSetAt[statuses[j]])
                {
                  found = true;

                  break;
                }
              }

              if (found)
              {
                return;
              }

              break;
            }

            case 'wo':
            {
              for (j = 0; j < statuses.length; ++j)
              {
                if (!statusesSetAt[statuses[j]])
                {
                  found = true;

                  break;
                }
              }

              if (!found)
              {
                return;
              }

              break;
            }
          }

          emit({c: cacheKey, o: this._id}, {
            _id: this._id,
            name: this.name,
            mrp: this.mrp,
            qty: this.qty,
            statusesSetAt: statusesSetAt,
            startDate: this.startDate,
            delayReason: this.delayReason,
            changes: changes
          });
        },
        reduce: function() {},
        out: {merge: 'cliporders'},
        query: mapReduceQuery,
        scope: {
          cacheKey: cacheKey,
          hourMode: query.hourMode,
          hour: hour,
          maxTime: maxTime,
          filter: filter,
          statuses: statuses
        },
        jsMode: toTime - fromTime > 3600 * 24 * 30 * 6 * 1000,
        verbose: true,
        nonAtomic: true
      },
      function(err, model, stats)
      {
        if (err)
        {
          return next(err);
        }

        reportsModule.mapReduceResults[cacheKey] = {
          clearTimer: setTimeout(clearMapReduceResults, MAP_REDUCE_CLEAR_DELAY, cacheKey),
          totalCount: stats.counts.emit
        };

        return sendCachedMapReduceResults(cacheKey);
      }
    );
  }

  function sendCachedMapReduceResults(cacheKey)
  {
    var mapReduceResult = reportsModule.mapReduceResults[cacheKey];

    if (!mapReduceResult)
    {
      return res.send({
        totalCount: 0,
        collection: []
      });
    }

    clearTimeout(mapReduceResult.clearTimer);

    mapReduceResult.clearTimer = setTimeout(clearMapReduceResults, MAP_REDUCE_CLEAR_DELAY, cacheKey);

    var conditions = {
      '_id.c': cacheKey
    };
    var queryOptions = {
      fields: {_id: 0},
      sort: {'_id.c': 1, 'value.startDate': 1},
      limit: req.rql.limit || 10,
      skip: req.rql.skip || 0
    };

    mongoose.connection.collection('cliporders').find(conditions, queryOptions).toArray(function(err, results)
    {
      if (err)
      {
        return next(err);
      }

      res.send({
        totalCount: mapReduceResult.totalCount,
        collection: results.map(function(result) { return result.value; })
      });
    });
  }

  function clearMapReduceResults(cacheKey)
  {
    delete reportsModule.mapReduceResults[cacheKey];

    mongoose.connection.collection('cliporders').remove({'_id.c': cacheKey}, function(err)
    {
      if (err)
      {
        reportsModule.error("Failed to remove cached CLIP orders [%s]: %s", cacheKey, err.message);
      }
    });
  }
};
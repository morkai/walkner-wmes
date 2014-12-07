// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var helpers = require('./helpers');
var report4 = require('../report4');

module.exports = function report4Route(app, reportsModule, req, res, next)
{
  var mongoose = app[reportsModule.config.mongooseId];

  var divisions = (typeof req.query.divisions === 'string' ? req.query.divisions : '')
    .split(',')
    .filter(function(divisionId) { return divisionId.length; });

  var options = {
    fromTime: helpers.getTime(req.query.from),
    toTime: helpers.getTime(req.query.to),
    interval: req.query.interval || 'day',
    mode: req.query.mode,
    downtimeReasons: helpers.getDowntimeReasons(app[reportsModule.config.downtimeReasonsId].models, true),
    subdivisions: getPressSubdivisions(app[reportsModule.config.orgUnitsId], divisions),
    prodNumConstant: reportsModule.prodNumConstant
  };

  if (isNaN(options.fromTime) || isNaN(options.toTime))
  {
    return next(new Error('INVALID_TIME'));
  }

  if (options.mode === 'shift')
  {
    options.shift = parseInt(req.query.shift, 10);

    if (options.shift !== 1 && options.shift !== 2 && options.shift !== 3)
    {
      return next(new Error('INVALID_SHIFT'));
    }
  }
  else if (options.mode === 'masters' || options.mode === 'operators')
  {
    options[options.mode] = (req.query[options.mode] || '')
      .split(',')
      .filter(function(userId) { return (/^[a-zA-Z0-9]{24}$/).test(userId); });

    if (options[options.mode].length === 0)
    {
      return next(new Error('INVALID_USER_IDS'));
    }
  }
  else
  {
    options.mode = null;
  }

  if (options.mode === 'masters' || options.mode === 'operators')
  {
    findUsers();
  }
  else
  {
    report();
  }

  function findUsers()
  {
    mongoose.model('User')
      .find(
        {_id: {$in: options[options.mode]}},
        {_id: 1, personellId: 1, firstName: 1, lastName: 1}
      )
      .lean()
      .exec(function(err, users)
      {
        if (err)
        {
          return next(err);
        }

        if (users.length !== options[options.mode].length)
        {
          return next(new Error('NONEXISTENT_USERS'));
        }

        options[options.mode] = users;

        report();
      });
  }

  function report()
  {
    helpers.generateReport(app, reportsModule, report4, '4', req.reportHash, options, function(err, reportJson)
    {
      if (err)
      {
        return next(err);
      }

      res.type('json');
      res.send(reportJson);
    });
  }
};

function getPressSubdivisions(orgUnitsModule, divisions)
{
  return orgUnitsModule.getAllByType('subdivision')
    .filter(function(subdivision)
    {
      return subdivision.type === 'press'
        && (divisions.length === 0 || divisions.indexOf(subdivision.division) !== -1);
    })
    .map(helpers.idToStr);
}

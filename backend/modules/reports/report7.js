// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var util = require('./util');
var report2 = require('./report2');

module.exports = function(mongoose, options, done)
{
  /*jshint validthis:true*/

  var ProdDowntime = mongoose.model('ProdDowntime');

  var results = {
    options: options,
    clip: []
  };

  step(
    function calcStep()
    {
      countClip(options.assemblyMrpControllers || [], this.parallel());
      countDowntimes(options, this.parallel());
    },
    function prepareResultsStep(err, clip, downtimes)
    {
      if (err)
      {
        return this.skip(err);
      }

      results.clip = clip;
      results.downtimes = downtimes;
    },
    function sendResultsStep(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, results);
      }
    }
  );

  function countClip(mrpControllers, done)
  {
    var clipOptions = {
      fromTime: moment().startOf('week').valueOf(),
      toTime: moment().startOf('week').add(1, 'week').valueOf(),
      interval: 'day',
      orgUnitType: null,
      orgUnitId: null,
      division: null,
      subdivisions: null,
      mrpControllers: mrpControllers
    };

    report2(mongoose, clipOptions, function(err, clipResults)
    {
      if (err)
      {
        return done(err);
      }

      var clip = clipResults.clip;
      var lastKeyMoment = clip.length
        ? moment(clip[clip.length - 1].key)
        : moment(clipOptions.fromTime).subtract(1, 'days');

      for (var i = clip.length; i <= 5; ++i)
      {
        lastKeyMoment.add(1, 'days');

        var weekDay = lastKeyMoment.day();

        if (weekDay === 0 || weekDay === 6)
        {
          continue;
        }

        clip.push({
          key: lastKeyMoment.valueOf(),
          orderCount: 0,
          productionCount: 0,
          endToEndCount: 0,
          production: 0,
          endToEnd: 0
        });
      }

      return done(null, clip);
    });
  }

  function countDowntimes(options, done)
  {
    /*globals mrpControllers,specificAor,emit*/

    var query = {
      startedAt: {
        $gte: moment().startOf('year').hours(6).toDate(),
        $lt: moment().startOf('year').add(1, 'year').hours(6).toDate()
      }
    };

    if (Array.isArray(options.statuses))
    {
      if (options.statuses.length === 2)
      {
        query.status = {$in: options.statuses};
      }
      else if (options.statuses.length === 1)
      {
        query.status = options.statuses[0];
      }
    }

    if (Array.isArray(options.aors))
    {
      var aors = options.aors
        .filter(function(aor) { return /^[a-f0-9]{24}$/.test(aor); })
        .map(function(aor) { return new mongoose.Types.ObjectId(aor); });

      if (aors.length === 1)
      {
        query.aor = aors[0];
      }
      else if (options.aors.length > 0)
      {
        query.aor = {$in: aors};
      }
    }

    ProdDowntime.mapReduce({
      map: function()
      {
        var inout = mrpControllers[this.mrpControllers[0]];

        if (inout === undefined || !this.finishedAt)
        {
          return;
        }

        var key = {
          y: this.date.getFullYear(),
          m: this.date.getMonth(),
          io: inout
        };
        var duration = (this.finishedAt.getTime() - this.startedAt.getTime()) / 60000;

        if (specificAor === this.aor.valueOf())
        {
          emit(key, {
            count: 0,
            duration: 0,
            specificCount: 1,
            specificDuration: duration
          });
        }
        else
        {
          emit(key, {
            count: 1,
            duration: duration,
            specificCount: 0,
            specificDuration: 0
          });
        }
      },
      reduce: function(key, values)
      {
        var result = {
          count: 0,
          duration: 0,
          specificCount: 0,
          specificDuration: 0
        };

        for (var i = 0, l = values.length; i < l; ++i)
        {
          var value = values[i];

          result.count += value.count;
          result.duration += value.duration;
          result.specificCount += value.specificCount;
          result.specificDuration += value.specificDuration;
        }

        return result;
      },
      out: {inline: 1},
      query: query,
      scope: {
        specificAor: options.specificAor,
        mrpControllers: options.inoutMrpControllers || {}
      }
    }, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      var groups = {};

      for (var i = 0; i < results.length; ++i)
      {
        var result = results[i];
        var key = new Date(result._id.y, result._id.m, 1, 0, 0, 0, 0).getTime();

        if (groups[key] === undefined)
        {
          groups[key] = createDataGroupEntry(key);
        }

        if (result._id.io === 1)
        {
          groups[key].indoorCount += result.value.count;
          groups[key].indoorDuration += result.value.duration;
          groups[key].specificIndoorCount += result.value.specificCount;
          groups[key].specificIndoorDuration += result.value.specificDuration;
        }
        else
        {
          groups[key].outdoorCount += result.value.count;
          groups[key].outdoorDuration += result.value.duration;
          groups[key].specificOutdoorCount += result.value.specificCount;
          groups[key].specificOutdoorDuration += result.value.specificDuration;
        }
      }

      var currentGroupKey = moment(query.startedAt.$gte).startOf('month');
      var lastGroupKey = moment().startOf('month').add(1, 'months').valueOf();

      while (currentGroupKey.valueOf() < lastGroupKey)
      {
        var groupKey = currentGroupKey.valueOf();

        if (!groups[groupKey])
        {
          groups[groupKey] = createDataGroupEntry(groupKey);
        }

        currentGroupKey.add(1, 'months');
      }

      var downtimes = _.values(groups).sort(function(a, b)
      {
        return a.key - b.key;
      });

      _.forEach(downtimes, function(downtime)
      {
        downtime.indoorDuration = util.round(downtime.indoorDuration);
        downtime.outdoorDuration = util.round(downtime.outdoorDuration);
        downtime.specificIndoorDuration = util.round(downtime.specificIndoorDuration);
        downtime.specificOutdoorDuration = util.round(downtime.specificOutdoorDuration);
      });

      return done(null, downtimes);
    });
  }

  function createDataGroupEntry(key)
  {
    return {
      key: key,
      indoorCount: 0,
      outdoorCount: 0,
      indoorDuration: 0,
      outdoorDuration: 0,
      specificIndoorCount: 0,
      specificOutdoorCount: 0,
      specificIndoorDuration: 0,
      specificOutdoorDuration: 0
    };
  }
};

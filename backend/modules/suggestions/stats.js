// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');
var later = require('later');

module.exports = function setUpKaizenCommands(app, module)
{
  var mongoose = app[module.config.mongooseId];
  var Suggestion = mongoose.model('Suggestion');

  var stats = {
    total: createEmptyStats(),
    users: {},
    currentTop10: [],
    previousTop10: []
  };
  var recountTimer = null;

  app.broker.subscribe('app.started', recountStats).setLimit(1);
  app.broker.subscribe('suggestions.added', scheduleRecountStats);
  app.broker.subscribe('suggestions.edited', scheduleRecountStats);
  app.broker.subscribe('suggestions.deleted', scheduleRecountStats);

  later.setInterval(recountStats, later.parse.text('on the first day of the month'));

  module.getStats = function(userId, done)
  {
    getUserStats(userId, function(err, userStats)
    {
      if (err)
      {
        return done(err);
      }

      return done(null, {
        total: stats.total,
        currentTop10: stats.currentTop10,
        previousTop10: stats.previousTop10,
        user: userStats
      });
    });
  };

  function createEmptyStats()
  {
    return {
      updatedAt: 0,
      allCount: 0,
      openCount: 0,
      monthCount: 0
    };
  }

  function scheduleRecountStats()
  {
    if (!recountTimer)
    {
      recountTimer = setTimeout(
        recountStats,
        Date.now() - stats.total.updatedAt > 60000 ? 1337 : 60000
      );
    }
  }

  function recountStats()
  {
    var t = Date.now();

    if (recountTimer)
    {
      clearTimeout(recountTimer);
    }

    step(
      function()
      {
        recountTotalStats(this.group());
        recountTop10(this.group());
      },
      function(err)
      {
        if (err)
        {
          module.error("[stats] Failed to recount: %s", err.message);
        }
        else
        {
          module.debug("[stats] Recounted in %d ms.", Date.now() - t);

          stats.users = {};
        }

        recountTimer = null;
      }
    );
  }

  function recountTotalStats(done)
  {
    countEntries(null, function(err, totalStats)
    {
      if (totalStats)
      {
        delete totalStats._id;

        totalStats.updatedAt = Date.now();
        stats.total = totalStats;
      }

      done(err, totalStats);
    });
  }

  function recountTop10(done)
  {
    var currentMonth = moment().startOf('month').toDate();
    var previousMonth = moment(currentMonth.getTime()).subtract(1, 'month').toDate();
    var pipeline = [
      {$match: {
        date: {
          $gte: previousMonth
        },
        status: {
          $in: [
            'new',
            'accepted',
            'todo',
            'inProgress',
            'paused',
            'finished'
          ]
        }
      }},
      {$unwind: '$owners'},
      {$group: {
        _id: '$owners.id',
        name: {$last: '$owners.label'},
        currentCount: {
          $sum: {
            $cond: {
              if: {$gte: ['$date', currentMonth]},
              then: 1,
              else: 0
            }
          }
        },
        previousCount: {
          $sum: {
            $cond: {
              if: {$lt: ['$date', currentMonth]},
              then: 1,
              else: 0
            }
          }
        }
      }},
      {$sort: {previousCount: -1}}
    ];

    Suggestion.aggregate(pipeline, function(err, results)
    {
      if (err)
      {
        return done(err);
      }

      var previousTop10 = [];
      var currentTop10 = [];

      for (var i = 0; i < results.length; ++i)
      {
        var result = results[i];

        if (result.previousCount)
        {
          previousTop10.push({
            place: -1,
            _id: result._id,
            name: result.name,
            count: result.previousCount
          });
        }

        if (result.currentCount)
        {
          currentTop10.push({
            place: -1,
            _id: result._id,
            name: result.name,
            count: result.currentCount
          });
        }
      }

      stats.previousTop10 = prepareTop10(previousTop10);
      stats.currentTop10 = prepareTop10(currentTop10);

      return done(null);
    });
  }

  function prepareTop10(top10)
  {
    top10.sort(function(a, b)
    {
      if (a.count === b.count)
      {
        return a.name.localeCompare(b.name);
      }

      return b.count - a.count;
    });

    top10 = top10.slice(0, 10);

    var lastPlace = 0;
    var lastCount = 0;

    _.forEach(top10, function(contender)
    {
      if (contender.count === lastCount)
      {
        contender.place = lastPlace;
      }
      else
      {
        lastPlace += 1;
        lastCount = contender.count;

        contender.place = lastPlace;
      }
    });

    return top10;
  }

  function getUserStats(userId, done)
  {
    if (!userId)
    {
      return setImmediate(done, null, createEmptyStats());
    }

    var userStats = stats.users[userId];

    if (userStats)
    {
      return setImmediate(done, null, userStats);
    }

    countEntries(userId, function(err, userStats)
    {
      if (!userStats)
      {
        userStats = createEmptyStats();
      }
      else
      {
        delete userStats._id;
      }

      userStats.updatedAt = Date.now();
      stats.users[userId] = userStats;

      done(err, userStats);
    });
  }

  function countEntries(userId, done)
  {
    var pipeline = [];

    if (!_.isEmpty(userId))
    {
      pipeline.push({$match: {
        'observers.user.id': userId
      }});
    }

    pipeline.push({$group: {
      _id: null,
      allCount: {$sum: 1},
      openCount: {$sum: {
        $cond: {if: {$eq: ['$status', 'new']}, then: 1, else: {
          $cond: {if: {$eq: ['$status', 'accepted']}, then: 1, else: {
            $cond: {if: {$eq: ['$status', 'todo']}, then: 1, else: {
              $cond: {if: {$eq: ['$status', 'inProgress']}, then: 1, else: {
                $cond: {if: {$eq: ['$status', 'paused']}, then: 1, else: 0}
              }}
            }}
          }}
        }}
      }},
      monthCount: {$sum: {
        $cond: {
          if: {$gte: ['$date', moment().startOf('month').toDate()]},
          then: 1,
          else: 0
        }
      }}
    }});

    Suggestion.aggregate(pipeline, function(err, results)
    {
      done(err, Array.isArray(results) && results.length ? results[0] : null);
    });
  }
};

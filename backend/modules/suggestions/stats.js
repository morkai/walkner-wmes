// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const later = require('later');

module.exports = function setUpKaizenCommands(app, module)
{
  const mongoose = app[module.config.mongooseId];
  const Suggestion = mongoose.model('Suggestion');

  const stats = {
    total: createEmptyStats(),
    users: {},
    currentTop10: [],
    previousTop10: []
  };
  let recountTimer = null;

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
    const t = Date.now();

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
          module.error('[stats] Failed to recount: %s', err.message);
        }
        else
        {
          module.debug('[stats] Recounted in %d ms.', Date.now() - t);

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
    const currentMonth = moment().startOf('month').toDate();
    const previousMonth = moment(currentMonth.getTime()).subtract(1, 'month').toDate();
    const pipeline = [
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

      const previousTop10 = [];
      const currentTop10 = [];

      for (let i = 0; i < results.length; ++i)
      {
        const result = results[i];

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

    let lastPlace = 0;
    let lastCount = 0;

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

    const userStats = stats.users[userId];

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
    const pipeline = [];

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

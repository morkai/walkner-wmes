// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function syncProgramsRoute(app, xiconfModule, req, res, next)
{
  if (!_.isArray(req.body))
  {
    return next(new Error('INPUT'));
  }

  var mongoose = app[xiconfModule.config.mongooseId];
  var XiconfProgram = mongoose.model('XiconfProgram');

  xiconfModule.programSyncQueue.push({req: req, res: res, next: next});

  syncNext();

  function syncNext()
  {
    var args = xiconfModule.programSyncQueue.shift();

    if (!args)
    {
      return;
    }

    var req = args.req;
    var res = args.res;
    var next = args.next;

    var remotePrograms = programListToMap(req.body);

    step(
      function checkSocketStep()
      {
        if (!req.socket.writable)
        {
          return this.skip(new Error('SOCKET_CLOSED'));
        }
      },
      function findProgramsStep()
      {
        XiconfProgram.find().exec(this.next());
      },
      function compareProgramsStep(err, programs)
      {
        if (err)
        {
          return this.skip(err);
        }

        var localPrograms = programListToMap(programs);
        var localCreatedPrograms = [];
        var localUpdatedPrograms = [];
        var localDeletedPrograms = [];
        var remoteUpdatedPrograms = [];
        var remoteDeletedPrograms = [];

        _.forEach(remotePrograms, function(remoteProgram)
        {
          delete remotePrograms[remoteProgram._id];

          if (!_.isArray(remoteProgram.steps))
          {
            remoteProgram.steps = tryJsonParseSteps(remoteProgram.steps);
          }

          var localProgram = localPrograms[remoteProgram._id];

          if (!localProgram)
          {
            if (remoteProgram.deleted)
            {
              return;
            }

            localCreatedPrograms.push(new XiconfProgram(remoteProgram));

            return;
          }

          delete localPrograms[remoteProgram._id];

          var localUpdatedAt = localProgram.updatedAt.getTime();

          if (remoteProgram.updatedAt === localUpdatedAt)
          {
            return;
          }

          if (remoteProgram.updatedAt > localUpdatedAt)
          {
            if (remoteProgram.deleted)
            {
              localProgram.updatedAt = remoteProgram.updatedAt;
              localProgram.deleted = true;

              localDeletedPrograms.push(localProgram);
            }
            else
            {
              localProgram.set(remoteProgram);

              localUpdatedPrograms.push(localProgram);
            }
          }
          else
          {
            if (localProgram.deleted)
            {
              remoteDeletedPrograms.push(localProgram);
            }
            else
            {
              remoteUpdatedPrograms.push(localProgram);
            }
          }
        });

        var remoteCreatedPrograms = _.values(localPrograms).filter(function(program) { return !program.deleted; });

        this.remoteChanges = {
          created: remoteCreatedPrograms,
          updated: remoteUpdatedPrograms,
          deleted: remoteDeletedPrograms
        };

        this.localChanges = {
          created: localCreatedPrograms,
          updated: localUpdatedPrograms,
          deleted: localDeletedPrograms
        };

        setImmediate(this.next());
      },
      function applyChangesStep(err)
      {
        if (err)
        {
          return next(err);
        }

        var localChanges = this.localChanges;
        var i;

        for (i = 0; i < localChanges.created.length; ++i)
        {
          localChanges.created[i].save(this.parallel());
        }

        for (i = 0; i < localChanges.updated.length; ++i)
        {
          localChanges.updated[i].save(this.parallel());
        }

        for (i = 0; i < localChanges.deleted.length; ++i)
        {
          localChanges.deleted[i].save(this.parallel());
        }
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          next(err);
        }
        else
        {
          res.json(this.remoteChanges);

          var user = req.session.user;
          var localChanges = this.localChanges;
          var i;

          for (i = 0; i < localChanges.created.length; ++i)
          {
            app.broker.publish(XiconfProgram.TOPIC_PREFIX + '.added', {
              model: localChanges.created[i],
              user: user
            });
          }

          for (i = 0; i < localChanges.updated.length; ++i)
          {
            app.broker.publish(XiconfProgram.TOPIC_PREFIX + '.edited', {
              model: localChanges.updated[i],
              user: user
            });
          }

          for (i = 0; i < localChanges.deleted.length; ++i)
          {
            app.broker.publish(XiconfProgram.TOPIC_PREFIX + '.deleted', {
              model: localChanges.deleted[i],
              user: user
            });
          }
        }

        setImmediate(syncNext);
      }
    );
  }

  function tryJsonParseSteps(steps)
  {
    try
    {
      return JSON.parse(steps);
    }
    catch (err)
    {
      return [];
    }
  }

  function programListToMap(programList)
  {
    var programMap = {};

    _.forEach(programList, function(program)
    {
      programMap[program._id] = program;
    });

    return programMap;
  }
};

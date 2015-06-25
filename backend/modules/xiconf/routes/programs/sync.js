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

    step(
      function checkSocketStep()
      {
        if (!req.socket.writable)
        {
          return this.skip(new Error('SOCKET_CLOSED'));
        }
      },
      function prepareRemoteProgramsStep()
      {
        this.remotePrograms = programListToMap(req.body);

        return setImmediate(this.next());
      },
      function findProgramsStep()
      {
        XiconfProgram.find().exec(this.next());
      },
      function prepareLocalProgramsStep(err, programs)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.localPrograms = programListToMap(programs);

        return setImmediate(this.next());
      },
      function compareProgramsStep()
      {
        this.remoteChanges = {
          created: [],
          updated: [],
          deleted: []
        };

        this.localChanges = {
          created: [],
          updated: [],
          deleted: []
        };

        var remoteProgramIds = Object.keys(this.remotePrograms);

        compareNextProgram(
          remoteProgramIds,
          this.remotePrograms,
          this.localPrograms,
          this.remoteChanges,
          this.localChanges,
          this.next()
        );
      },
      function setRemoteCreatedProgramsStep()
      {
        this.remoteChanges.created = _.filter(
          _.values(this.localPrograms),
          function(program) { return !program.deleted; }
        );

        setImmediate(this.next());
      },
      function applyChangesStep()
      {
        var localChanges = this.localChanges;
        var i;

        for (i = 0; i < localChanges.created.length; ++i)
        {
          localChanges.created[i].save(this.group());
        }

        for (i = 0; i < localChanges.updated.length; ++i)
        {
          localChanges.updated[i].save(this.group());
        }

        for (i = 0; i < localChanges.deleted.length; ++i)
        {
          localChanges.deleted[i].save(this.group());
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

        this.remoteChanges = null;
        this.localChanges = null;
        this.remotePrograms = null;
        this.localPrograms = null;

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

  function compareNextProgram(remoteProgramIds, remotePrograms, localPrograms, remoteChanges, localChanges, done)
  {
    var remoteProgramId = remoteProgramIds.shift();

    if (!remoteProgramId)
    {
      return done();
    }

    var remoteProgram = remotePrograms[remoteProgramId];

    delete remotePrograms[remoteProgram._id];

    if (!_.isArray(remoteProgram.steps))
    {
      remoteProgram.steps = tryJsonParseSteps(remoteProgram.steps);
    }

    var localProgram = localPrograms[remoteProgram._id];

    if (!localProgram)
    {
      if (!remoteProgram.deleted)
      {
        localChanges.created.push(new XiconfProgram(remoteProgram));
      }

      return setImmediate(
        compareNextProgram,
        remoteProgramIds,
        remotePrograms,
        localPrograms,
        remoteChanges,
        localChanges,
        done
      );
    }

    delete localPrograms[remoteProgram._id];

    var localUpdatedAt = localProgram.updatedAt.getTime();

    if (remoteProgram.updatedAt > localUpdatedAt)
    {
      if (remoteProgram.deleted)
      {
        localProgram.updatedAt = remoteProgram.updatedAt;
        localProgram.deleted = true;

        localChanges.deleted.push(localProgram);
      }
      else
      {
        localProgram.set(remoteProgram);

        localChanges.updated.push(localProgram);
      }
    }
    else if (remoteProgram.updatedAt !== localUpdatedAt)
    {
      if (localProgram.deleted)
      {
        remoteChanges.deleted.push(localProgram);
      }
      else
      {
        remoteChanges.updated.push(localProgram);
      }
    }

    return setImmediate(
      compareNextProgram,
      remoteProgramIds,
      remotePrograms,
      localPrograms,
      remoteChanges,
      localChanges,
      done
    );
  }
};

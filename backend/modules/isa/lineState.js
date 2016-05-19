// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var uuid = require('node-uuid');

module.exports = function setUpIsaLineState(app, isaModule)
{
  var ACTION_LOCK_TIMEOUT = 2000;

  var mongoose = app[isaModule.config.mongooseId];
  var orgUnitsModule = app[isaModule.config.orgUnitsId];
  var userModule = app[isaModule.config.userId];

  var User = mongoose.model('User');
  var IsaEvent = mongoose.model('IsaEvent');
  var IsaRequest = mongoose.model('IsaRequest');
  var IsaLineState = mongoose.model('IsaLineState');
  var IsaPalletKind = mongoose.model('IsaPalletKind');

  var loaded = false;
  var lineStateMap = {};
  var lockMap = {};
  var actionHandlers = {};

  app.broker.subscribe('app.started', loadLineStates);

  isaModule.getLineStates = getLineStates;
  isaModule.getLineState = getLineState;
  isaModule.getLineStateSync = getLineStateSync;
  isaModule.updateLineState = updateLineState;

  function acquireLock(key, callback, queueIfNew)
  {
    if (lockMap[key])
    {
      if (callback)
      {
        lockMap[key].push(callback);
      }

      return null;
    }

    lockMap[key] = [];

    if (queueIfNew && callback)
    {
      lockMap[key].push(callback);
    }

    return function()
    {
      var callbacks = lockMap[key];

      lockMap[key] = null;

      for (var i = 0; i < callbacks.length; ++i)
      {
        callbacks[i].apply(null, arguments);
      }
    };
  }

  function loadLineStates()
  {
    var t = Date.now();

    step(
      function()
      {
        IsaLineState.find().exec(this.next());
      },
      function(err, lineStates)
      {
        var now = Date.now();
        var weekAgo = 7 * 24 * 3600 * 1000;
        var idsToDelete = [];

        _.forEach(lineStates, function(lineState)
        {
          var timeDiff = now - lineState.updatedAt.getTime();

          if (timeDiff >= weekAgo)
          {
            idsToDelete.push(lineState._id);
          }
          else
          {
            lineStateMap[lineState._id] = lineState;
          }
        });

        if (idsToDelete.length)
        {
          IsaLineState.remove({_id: {$in: idsToDelete}}, this.next());
        }
      },
      function()
      {
        loaded = true;

        app.broker.publish('isaLineStates.loaded');

        isaModule.debug("Loaded in %d ms.", Date.now() - t);
      }
    );
  }

  function getLineStates(done)
  {
    if (!loaded)
    {
      app.broker
        .subscribe('isaLineStates.loaded', getLineStates.bind(null, done))
        .setLimit(1);

      return;
    }

    setImmediate(done, null, _.values(lineStateMap));
  }

  function getLineState(prodLineId, done)
  {
    if (!loaded)
    {
      app.broker
        .subscribe('isaLineStates.loaded', getLineState.bind(null, prodLineId, done))
        .setLimit(1);

      return;
    }

    if (lineStateMap[prodLineId])
    {
      setImmediate(done, null, lineStateMap[prodLineId]);

      return;
    }

    if (!orgUnitsModule.getByTypeAndId('prodLine', prodLineId))
    {
      setImmediate(done, null, null);

      return;
    }

    var releaseLock = acquireLock('getLineState:' + prodLineId, done, true);

    if (!releaseLock)
    {
      return;
    }

    var lineState = new IsaLineState({
      _id: prodLineId,
      status: 'idle',
      updatedAt: new Date()
    });

    lineState.save(function(err)
    {
      if (err)
      {
        releaseLock(err);
      }
      else
      {
        lineStateMap[lineState._id] = lineState;

        releaseLock(null, lineState);
      }
    });
  }

  function getLineStateSync(prodLineId)
  {
    return lineStateMap[prodLineId] || null;
  }

  function recordEvent(eventData)
  {
    var event = new IsaEvent(eventData);

    event.save(function(err)
    {
      if (err)
      {
        isaModule.error("Failed to save event [%s]: %s", event.type, err.message);
      }
    });
  }

  function updateLineState(prodLineId, action, parameters, userData, done)
  {
    var handleAction = actionHandlers[action];

    if (!handleAction)
    {
      return setImmediate(done, app.createError('UNKNOWN_ACTION', 400));
    }

    var releaseLock = acquireLock(
      prodLineId,
      updateLineState.bind(null, prodLineId, action, parameters, userData, done),
      false
    );

    if (!releaseLock)
    {
      return;
    }

    step(
      function()
      {
        getLineState(prodLineId, this.next());
      },
      function(err, lineState)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!lineState)
        {
          return this.skip(app.createError('UNKNOWN_LINE', 404));
        }

        handleAction(lineState, parameters, userData, this.next());
      },
      function(err, result)
      {
        done(err, result);

        setImmediate(releaseLock);
      }
    );
  }

  function createRequest(prodLineId, type, requester, data, done)
  {
    var request = new IsaRequest({
      _id: uuid.v4().toUpperCase(),
      orgUnits: orgUnitsModule.getAllForProdLineAsList(prodLineId),
      type: type,
      data: data,
      requester: requester,
      requestedAt: new Date()
    });

    request.save(done);
  }

  actionHandlers.requestPickup = function(lineState, parameters, userData, done)
  {
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', lineState._id);

    if (parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    if (lineState.status !== 'idle')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    if ((Date.now() - lineState.updatedAt.getTime()) < ACTION_LOCK_TIMEOUT)
    {
      return done(app.createError('LOCKED', 400));
    }

    step(
      function()
      {
        createRequest(prodLine._id, 'pickup', userData.info, {}, this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.event = {
          type: 'pickupRequested',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.requestedAt,
          user: request.requester,
          data: {}
        };

        lineState.update(request).save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent(this.event);
        }

        this.event = null;

        done(err);
      }
    );
  };

  actionHandlers.requestDelivery = function(lineState, parameters, userData, done)
  {
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', lineState._id);

    if (parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    if (lineState.status !== 'idle')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    if ((Date.now() - lineState.updatedAt.getTime()) < ACTION_LOCK_TIMEOUT)
    {
      return done(app.createError('LOCKED', 400));
    }

    step(
      function()
      {
        IsaPalletKind.findById(parameters.palletKind, {shortName: 1}).lean().exec(this.next());
      },
      function(err, palletKind)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!palletKind)
        {
          return this.skip(app.createError('UNKNOWN_PALLET_KIND', 400));
        }

        var data = {
          palletKind: {
            id: palletKind._id.toString(),
            label: palletKind.shortName
          }
        };

        createRequest(prodLine._id, 'delivery', userData.info, data, this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.event = {
          type: 'deliveryRequested',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.requestedAt,
          user: userData.info,
          data: request.data
        };

        lineState.update(request).save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent(this.event);
        }

        this.event = null;

        done(err);
      }
    );
  };

  actionHandlers.cancelRequest = function(lineState, parameters, userData, done)
  {
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', lineState._id);

    if (lineState.status === 'idle')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    if (lineState.status === 'request')
    {
      if (userData.isWhman || userData.canManage || parameters.secretKey === prodLine.secretKey)
      {
        // Request can be cancelled by an Operator, Warehouseman or a user with the ISA:MANAGE privilege.
        _.noop();
      }
      else
      {
        return done(app.createError('AUTH', 403));
      }
    }

    if (lineState.status === 'response')
    {
      if (userData.isWhman || userData.canManage)
      {
        // Response can be cancelled by a Warehouseman or a user with the ISA:MANAGE privilege.
        _.noop();
      }
      else
      {
        return done(app.createError('AUTH', 403));
      }
    }

    if ((Date.now() - lineState.updatedAt.getTime()) < ACTION_LOCK_TIMEOUT)
    {
      return done(app.createError('LOCKED', 400));
    }

    step(
      function()
      {
        IsaRequest.findById(lineState.requestId).exec(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!request)
        {
          return this.skip(app.createError('UNKNOWN_REQUEST', 400));
        }

        request.cancel(userData.info);
        request.save(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.event = {
          type: 'requestCancelled',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.finishedAt,
          user: userData.info,
          data: {}
        };

        lineState.update(request).save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent(this.event);
        }

        this.event = null;

        done(err);
      }
    );
  };

  actionHandlers.acceptRequest = function(lineState, parameters, userData, done)
  {
    if (!userData.isWhman && !userData.canManage)
    {
      return done(app.createError('AUTH', 403));
    }

    if (lineState.status !== 'request')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    if (_.isEmpty(parameters.responder))
    {
      return done(app.createError('INVALID_RESPONDER', 400));
    }

    step(
      function()
      {
        User.findById(parameters.responder.id).lean().exec(this.next());
      },
      function(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          return this.skip(app.createError('UNKNOWN_RESPONDER', 400));
        }

        if (!_.includes(user.privileges, 'ISA:WHMAN'))
        {
          return this.skip(app.createError('INVALID_RESPONDER', 400));
        }

        parameters.responder = userModule.createUserInfo(user, null);
      },
      function()
      {
        IsaRequest.findById(lineState.requestId).exec(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!request)
        {
          return this.skip(app.createError('UNKNOWN_REQUEST', 400));
        }

        request.accept(parameters.responder);
        request.save(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.event = {
          type: 'requestAccepted',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.respondedAt,
          user: userData.info,
          data: {
            responder: request.responder
          }
        };

        lineState.update(request).save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent(this.event);
        }

        this.event = null;

        done(err);
      }
    );
  };

  actionHandlers.finishRequest = function(lineState, parameters, userData, done)
  {
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', lineState._id);

    if (!userData.isWhman && !userData.canManage && parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    if (lineState.status !== 'response')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    step(
      function()
      {
        IsaRequest.findById(lineState.requestId).exec(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!request)
        {
          return this.skip(app.createError('UNKNOWN_REQUEST', 400));
        }

        request.finish(userData.info);
        request.save(this.next());
      },
      function(err, request)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.event = {
          type: 'requestFinished',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.finishedAt,
          user: userData.info,
          data: {}
        };

        lineState.update(request).save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent(this.event);
        }

        this.event = null;

        done(err);
      }
    );
  };
};

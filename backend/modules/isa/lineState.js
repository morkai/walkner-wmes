// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var uuid = require('node-uuid');

module.exports = function setUpIsaLineState(app, isaModule)
{
  var mongoose = app[isaModule.config.mongooseId];
  var orgUnitsModule = app[isaModule.config.orgUnitsId];
  var userModule = app[isaModule.config.userId];

  var User = mongoose.model('User');
  var IsaEvent = mongoose.model('IsaEvent');
  var IsaRequest = mongoose.model('IsaRequest');
  var IsaPalletKind = mongoose.model('IsaPalletKind');

  var loaded = false;
  var idToRequestMap = {};
  var lineToRequestsMap = {};
  var lockMap = {};
  var actionHandlers = {};

  app.broker.subscribe('app.started', loadActiveRequests);
  app.broker.subscribe('isaRequests.created.**', mapNewRequest);
  app.broker.subscribe('isaRequests.updated.**', mapExistingRequest);

  isaModule.getAllActiveRequests = getAllActiveRequests;
  isaModule.getLineActiveRequests = getLineActiveRequests;
  isaModule.updateActiveRequest = updateActiveRequest;

  function mapNewRequest(request)
  {
    const prodLineId = request.getProdLineId();

    if (!lineToRequestsMap[prodLineId])
    {
      lineToRequestsMap[prodLineId] = [];
    }

    lineToRequestsMap[prodLineId].push(request);

    idToRequestMap[request._id] = request;
  }

  function mapExistingRequest(changes)
  {
    if (changes.status === 'new' || changes.status === 'accepted')
    {
      return;
    }

    const request = idToRequestMap[changes._id];

    if (!request)
    {
      return;
    }

    const prodLineId = request.getProdLineId();

    lineToRequestsMap[prodLineId] = lineToRequestsMap[prodLineId].filter(d => d !== request);

    delete idToRequestMap[request._id];
  }

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

  function loadActiveRequests()
  {
    var t = Date.now();

    step(
      function()
      {
        IsaRequest.find({status: {$in: ['new', 'accepted']}}).exec(this.next());
      },
      function(err, requests)
      {
        _.forEach(requests, mapNewRequest);

        loaded = true;

        app.broker.publish('isaRequests.loaded');

        isaModule.debug("Loaded in %d ms.", Date.now() - t);
      }
    );
  }

  function getAllActiveRequests(done)
  {
    if (!loaded)
    {
      app.broker
        .subscribe('isaRequests.loaded', getAllActiveRequests.bind(null, done))
        .setLimit(1);

      return;
    }

    setImmediate(done, null, _.values(idToRequestMap));
  }

  function getLineActiveRequests(prodLineId, done)
  {
    if (!loaded)
    {
      app.broker
        .subscribe('isaRequests.loaded', getLineActiveRequests.bind(null, prodLineId, done))
        .setLimit(1);

      return;
    }

    setImmediate(done, null, lineToRequestsMap[prodLineId] || []);
  }

  function recordEvent(eventData)
  {
    const event = new IsaEvent(eventData);

    event.save(function(err)
    {
      if (err)
      {
        isaModule.error("Failed to save event [%s]: %s", event.type, err.message);
      }
    });
  }

  function updateActiveRequest(prodLineId, action, parameters, userData, done)
  {
    const handleAction = actionHandlers[action];

    if (!handleAction)
    {
      return setImmediate(done, app.createError('UNKNOWN_ACTION', 400));
    }

    var releaseLock = acquireLock(
      prodLineId,
      updateActiveRequest.bind(null, prodLineId, action, parameters, userData, done),
      false
    );

    if (!releaseLock)
    {
      return;
    }

    handleAction(prodLineId, parameters, userData, function(err, result)
    {
      done(err, result);

      setImmediate(releaseLock);
    });
  }

  function createRequest(prodLineId, type, requester, data, done)
  {
    const request = new IsaRequest({
      _id: uuid.v4().toUpperCase(),
      orgUnits: orgUnitsModule.getAllForProdLineAsList(prodLineId),
      type: type,
      data: data,
      requester: requester,
      requestedAt: new Date()
    });

    request.save(done);
  }

  function hasActiveRequest(prodLineId, requestType)
  {
    return _.some(lineToRequestsMap[prodLineId], request => request.type === requestType);
  }

  actionHandlers.requestPickup = function(prodLineId, parameters, userData, done)
  {
    const prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (!prodLine)
    {
      return done(app.createError('UNKNOWN_LINE', 400));
    }

    if (parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    if (hasActiveRequest(prodLineId, 'pickup'))
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    createRequest(prodLine._id, 'pickup', userData.info, {}, function(err, request)
    {
      if (!err)
      {
        recordEvent({
          type: 'pickupRequested',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.requestedAt,
          user: request.requester,
          data: {}
        });
      }

      done(err);
    });
  };

  actionHandlers.requestDelivery = function(prodLineId, parameters, userData, done)
  {
    const prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (!prodLine)
    {
      return done(app.createError('UNKNOWN_LINE', 400));
    }

    if (parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    if (hasActiveRequest(prodLineId, 'delivery'))
    {
      return done(app.createError('INVALID_STATUS', 400));
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
        if (!err)
        {
          recordEvent({
            type: 'deliveryRequested',
            requestId: request._id,
            orgUnits: request.orgUnits,
            time: request.requestedAt,
            user: userData.info,
            data: request.data
          });
        }

        done(err);
      }
    );
  };

  actionHandlers.cancelRequest = function(prodLineId, parameters, userData, done)
  {
    var request = idToRequestMap[parameters.requestId];

    if (!request)
    {
      return done(app.createError('UNKNOWN_REQUEST', 400));
    }

    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (!prodLine)
    {
      return done(app.createError('UNKNOWN_LINE', 400));
    }

    if (request.status === 'finished' || request.status === 'cancelled')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    if (request.status === 'new')
    {
      if (userData.isLocal || userData.isWhman || userData.canManage || parameters.secretKey === prodLine.secretKey)
      {
        // New requests can be cancelled by an Operator, Warehouseman or a user with the ISA:MANAGE privilege.
        // TODO: remove local access
        _.noop();
      }
      else
      {
        return done(app.createError('AUTH', 403));
      }
    }

    if (request.status === 'accepted')
    {
      if (userData.isLocal || userData.isWhman || userData.canManage)
      {
        // Accepted requests can be cancelled by a Warehouseman or a user with the ISA:MANAGE privilege.
        // TODO: remove local access
        _.noop();
      }
      else
      {
        return done(app.createError('AUTH', 403));
      }
    }

    request.cancel(userData.info);
    request.save(function(err)
    {
      if (!err)
      {
        recordEvent({
          type: 'requestCancelled',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.finishedAt,
          user: userData.info,
          data: {}
        });
      }

      done(err);
    });
  };

  actionHandlers.acceptRequest = function(prodLineId, parameters, userData, done)
  {
    // TODO: remove local access
    if (!userData.isLocal && !userData.isWhman && !userData.canManage)
    {
      return done(app.createError('AUTH', 403));
    }

    var request = idToRequestMap[parameters.requestId];

    if (!request)
    {
      return done(app.createError('UNKNOWN_REQUEST', 400));
    }

    if (request.status !== 'new')
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

        request.accept(parameters.responder);
        request.save(this.next());
      },
      function(err)
      {
        if (!err)
        {
          recordEvent({
            type: 'requestAccepted',
            requestId: request._id,
            orgUnits: request.orgUnits,
            time: request.respondedAt,
            user: userData.info,
            data: {
              responder: request.responder
            }
          });
        }

        done(err);
      }
    );
  };

  actionHandlers.finishRequest = function(prodLineId, parameters, userData, done)
  {
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (!prodLine)
    {
      return done(app.createError('UNKNOWN_LINE', 400));
    }

    // TODO: remove local access
    if (!userData.isLocal && !userData.isWhman && !userData.canManage && parameters.secretKey !== prodLine.secretKey)
    {
      return done(app.createError('AUTH', 403));
    }

    var request = idToRequestMap[parameters.requestId];

    if (!request)
    {
      return done(app.createError('UNKNOWN_REQUEST', 400));
    }

    if (request.status !== 'accepted')
    {
      return done(app.createError('INVALID_STATUS', 400));
    }

    request.finish(userData.info);
    request.save(function(err)
    {
      if (!err)
      {
        recordEvent({
          type: 'requestFinished',
          requestId: request._id,
          orgUnits: request.orgUnits,
          time: request.finishedAt,
          user: userData.info,
          data: {}
        });
      }

      done(err);
    });
  };
};

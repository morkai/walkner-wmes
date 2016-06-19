// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpIsaRoutes(app, isaModule)
{
  const express = app[isaModule.config.expressId];
  const userModule = app[isaModule.config.userId];
  const mongoose = app[isaModule.config.mongooseId];

  const IsaEvent = mongoose.model('IsaEvent');
  const IsaRequest = mongoose.model('IsaRequest');

  const canView = userModule.auth('LOCAL', 'ISA:VIEW');
  const canManage = userModule.auth('LOCAL', 'ISA:MANAGE');

  express.get('/isaEvents', canView, express.crud.browseRoute.bind(null, app, IsaEvent));
  express.get('/isaEvents;export', canView, express.crud.exportRoute.bind(null, {
    filename: 'ISA-EVENTS',
    serializeRow: exportEvent,
    model: IsaEvent
  }));

  express.get('/isaRequests', canView, express.crud.browseRoute.bind(null, app, IsaRequest));
  express.get('/isaRequests;export', canView, express.crud.exportRoute.bind(null, {
    filename: 'ISA-REQUESTS',
    serializeRow: exportRequest,
    model: IsaRequest
  }));

  express.get('/isaShiftPersonnel/:shiftDate', canView, readShiftPersonnelRoute);
  express.put('/isaShiftPersonnel/:shiftDate', canManage, updateShiftPersonnelRoute);

  express.get('/isaActiveRequests', canView, browseAllActiveRequestsRoute);
  express.get('/isaActiveRequests/:line', canView, browseLineActiveRequestsRoute);
  express.patch('/isaActiveRequests/:line', canView, updateLineActiveRequestRoute);

  function readShiftPersonnelRoute(req, res, next)
  {
    const shiftDate = req.params.shiftDate === 'current' ? null : new Date(req.params.shiftDate);

    if (shiftDate && isNaN(shiftDate.getTime()))
    {
      return next(app.createError('INVALID_SHIFT_DATE', 400));
    }

    isaModule.getShiftPersonnel(shiftDate, function(err, shiftPersonnel)
    {
      if (err)
      {
        return next(err);
      }

      res.json(shiftPersonnel);
    });
  }

  function updateShiftPersonnelRoute(req, res, next)
  {
    const shiftDate = req.params.shiftDate === 'current' ? null : new Date(req.params.shiftDate);

    if (shiftDate && isNaN(shiftDate.getTime()))
    {
      return next(app.createError('INVALID_SHIFT_DATE', 400));
    }

    const updater = userModule.createUserInfo(req.session.user, req);

    isaModule.updateShiftPersonnel(shiftDate, req.body.users, updater, function(err, shiftPersonnel)
    {
      if (err)
      {
        return next(err);
      }

      res.json(shiftPersonnel);
    });
  }

  function browseAllActiveRequestsRoute(req, res, next)
  {
    isaModule.getAllActiveRequests(function(err, requests)
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: requests.length,
        collection: requests
      });
    });
  }

  function browseLineActiveRequestsRoute(req, res, next)
  {
    isaModule.getLineActiveRequests(req.params.line, function(err, requests)
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: requests.length,
        collection: requests
      });
    });
  }

  function updateLineActiveRequestRoute(req, res, next)
  {
    const user = req.session.user;
    const userData = {
      info: userModule.createUserInfo(user, req),
      canView: userModule.isAllowedTo(user, 'ISA:VIEW'),
      canManage: userModule.isAllowedTo(user, 'ISA:MANAGE'),
      isWhman: userModule.isAllowedTo(user, 'ISA:WHMAN'),
      isLocal: user.local
    };
    const prodLineId = req.params.line;
    const action = req.body.action;
    const parameters = req.body;

    isaModule.updateActiveRequest(prodLineId, action, parameters, userData, function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      if (result)
      {
        return res.json(result);
      }

      return res.sendStatus(204);
    });
  }

  function exportEvent(doc)
  {
    return {
      'requestId': doc.requestId || '',
      '"division': doc.orgUnits.length ? doc.orgUnits[0].id : '',
      '"prodLine': doc.orgUnits.length ? doc.orgUnits[doc.orgUnits.length - 1].id : '',
      '"action': doc.type,
      'time': app.formatDateTime(doc.time),
      '"user': doc.user.label,
      '"palletKind': doc.data.palletKind ? doc.data.palletKind.label : '',
      '"whman': doc.data.responder ? doc.data.responder.label : ''
    };
  }

  function exportRequest(doc)
  {
    return {
      'id': doc._id,
      '"division': doc.orgUnits.length ? doc.orgUnits[0].id : '',
      '"prodLine': doc.orgUnits.length ? doc.orgUnits[doc.orgUnits.length - 1].id : '',
      '"type': doc.type,
      '"palletKind': doc.data.palletKind ? doc.data.palletKind.label : '',
      '"status': doc.status,
      '"requester': doc.requester.label,
      'requestedAt': app.formatDateTime(doc.requestedAt),
      '"whman': doc.responder ? doc.responder.label : '',
      'respondedAt': app.formatDateTime(doc.respondedAt),
      '"finisher': doc.finisher ? doc.finisher.label : '',
      'finishedAt': app.formatDateTime(doc.finishedAt),
      '#duration': doc.status === 'finished' || doc.status === 'cancelled' ? doc.duration : 0
    };
  }
};

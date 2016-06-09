// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpIsaRoutes(app, isaModule)
{
  var express = app[isaModule.config.expressId];
  var userModule = app[isaModule.config.userId];
  var mongoose = app[isaModule.config.mongooseId];

  var IsaEvent = mongoose.model('IsaEvent');
  var IsaRequest = mongoose.model('IsaRequest');

  var canView = userModule.auth('LOCAL', 'ISA:VIEW');
  var canManage = userModule.auth('ISA:MANAGE');

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

  express.get('/isaLineStates', canView, browseLineStatesRoute);
  express.get('/isaLineStates/:id', canView, readLineStateRoute);
  express.patch('/isaLineStates/:id', canView, updateLineStateRoute);

  function readShiftPersonnelRoute(req, res, next)
  {
    var shiftDate = req.params.shiftDate === 'current' ? null : new Date(req.params.shiftDate);

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
    var shiftDate = req.params.shiftDate === 'current' ? null : new Date(req.params.shiftDate);

    if (shiftDate && isNaN(shiftDate.getTime()))
    {
      return next(app.createError('INVALID_SHIFT_DATE', 400));
    }

    var updater = userModule.createUserInfo(req.session.user, req);

    isaModule.updateShiftPersonnel(shiftDate, req.body.users, updater, function(err, shiftPersonnel)
    {
      if (err)
      {
        return next(err);
      }

      res.json(shiftPersonnel);
    });
  }

  function browseLineStatesRoute(req, res, next)
  {
    isaModule.getLineStates(function(err, lineStates)
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: lineStates.length,
        collection: lineStates
      });
    });
  }

  function readLineStateRoute(req, res, next)
  {
    isaModule.getLineState(req.params.id, function(err, lineState)
    {
      if (err)
      {
        return next(err);
      }

      if (!lineState)
      {
        return res.sendStatus(404);
      }

      if (isaModule.disabled)
      {
        isaModule.disabled[lineState._id] = true;

        return next(app.createError('MODULE_DISABLED', 503));
      }

      res.json(lineState);
    });
  }

  function updateLineStateRoute(req, res, next)
  {
    var user = req.session.user;
    var userData = {
      info: userModule.createUserInfo(user, req),
      canView: userModule.isAllowedTo(user, 'ISA:VIEW'),
      canManage: userModule.isAllowedTo(user, 'ISA:MANAGE'),
      isWhman: userModule.isAllowedTo(user, 'ISA:WHMAN'),
      isLocal: user.local
    };
    var prodLineId = req.params.id;
    var action = req.body.action;
    var parameters = req.body;

    isaModule.updateLineState(prodLineId, action, parameters, userData, function(err, result)
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

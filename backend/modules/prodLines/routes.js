// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdLinesRoutes(app, prodLinesModule, useDictionaryModel)
{
  var express = app[prodLinesModule.config.expressId];
  var auth = app[prodLinesModule.config.userId].auth;
  var ProdLine = app[prodLinesModule.config.mongooseId].model('ProdLine');

  var canView = auth('LOCAL', 'DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodLines', canView, express.crud.browseRoute.bind(null, app, ProdLine));

  express.post('/prodLines', canManage, express.crud.addRoute.bind(null, app, ProdLine));

  express.get('/prodLines/:id', canView, express.crud.readRoute.bind(null, app, ProdLine));

  express.put(
    '/prodLines/:id',
    canManage,
    useDictionaryModel,
    prepareModelForEdit,
    denyIfDeactivated,
    express.crud.editRoute.bind(null, app, ProdLine)
  );

  express.delete(
    '/prodLines/:id',
    canManage,
    useDictionaryModel,
    denyIfDeactivated,
    express.crud.deleteRoute.bind(null, app, ProdLine)
  );

  function prepareModelForEdit(req, res, next)
  {
    delete req.body.prodShift;
    delete req.body.prodShiftOrder;
    delete req.body.prodDowntime;
    delete req.body.secretKey;

    next();
  }

  function denyIfDeactivated(req, res, next)
  {
    if (req.model && req.model.deactivatedAt && !req.session.user.super)
    {
      return next(express.createHttpError('NO_ACCESS', 403));
    }

    next();
  }
};

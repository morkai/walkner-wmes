// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setUpProdChangeRequestsRoutes(app, pcrModule)
{
  var express = app[pcrModule.config.expressId];
  var userModule = app[pcrModule.config.userId];
  var mongoose = app[pcrModule.config.mongooseId];
  var prodShiftsModule = app[pcrModule.config.prodShiftsId];
  var prodShiftOrdersModule = app[pcrModule.config.prodShiftOrdersId];
  var prodDowntimesModule = app[pcrModule.config.prodDowntimesId];
  var ProdShift = mongoose.model('ProdShift');
  var ProdShiftOrder = mongoose.model('ProdShiftOrder');
  var ProdDowntime = mongoose.model('ProdDowntime');
  var ProdChangeRequest = mongoose.model('ProdChangeRequest');

  var TYPE_TO_OPERATION = {
    shift: {
      add: prodShiftsModule.addProdShift,
      edit: prodShiftsModule.editProdShift,
      delete: prodShiftsModule.deleteProdShift
    },
    order: {
      add: prodShiftOrdersModule.addProdShiftOrder,
      edit: prodShiftOrdersModule.editProdShiftOrder,
      delete: prodShiftOrdersModule.deleteProdShiftOrder
    },
    downtime: {
      add: prodDowntimesModule.addProdDowntime,
      edit: prodDowntimesModule.editProdDowntime,
      delete: prodDowntimesModule.deleteProdDowntime
    }
  };

  var canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PROD_DATA:CHANGES:REQUEST');
  var canManage = userModule.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:MANAGE');

  express.get('/prodChangeRequests', canView, express.crud.browseRoute.bind(null, app, {
    model: ProdChangeRequest,
    prepareResult: prepareProdChangeRequests
  }));

  express.post('/prodChangeRequests/:id', canManage, confirmRoute);

  function prepareProdChangeRequests(totalCount, prodChangeRequests, done)
  {
    var typeToProdData = {
      shift: {},
      order: {},
      downtime: {}
    };

    _.forEach(prodChangeRequests, function(prodChangeRequest)
    {
      prodChangeRequest.prodModel = null;

      if (!prodChangeRequest.modelId)
      {
        return;
      }

      var modelIdToChangeRequestId = typeToProdData[prodChangeRequest.modelType];
      var modelId = prodChangeRequest.modelId;

      if (!modelIdToChangeRequestId[modelId])
      {
        modelIdToChangeRequestId[modelId] = [];
      }

      modelIdToChangeRequestId[modelId].push(prodChangeRequest);
    });

    step(
      function findRelatedModelsStep()
      {
        var shiftIds = Object.keys(typeToProdData.shift);
        var orderIds = Object.keys(typeToProdData.order);
        var downtimeIds = Object.keys(typeToProdData.downtime);

        if (shiftIds.length)
        {
          ProdShift.find({_id: {$in: shiftIds}}).lean().exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }

        if (orderIds.length)
        {
          ProdShiftOrder.find({_id: {$in: orderIds}}).lean().exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }

        if (downtimeIds.length)
        {
          ProdDowntime.find({_id: {$in: downtimeIds}}).lean().exec(this.parallel());
        }
        else
        {
          setImmediate(this.parallel(), null, []);
        }
      },
      function assignRelatedModelsStep(err, shifts, orders, downtimes)
      {
        if (err)
        {
          return this.skip(err);
        }

        assignProdModelsToChangeRequests('shift', shifts);
        assignProdModelsToChangeRequests('order', orders);
        assignProdModelsToChangeRequests('downtime', downtimes);

        function assignProdModelsToChangeRequests(type, prodModels)
        {
          _.forEach(prodModels, function(prodModel)
          {
            assignProdModelToChangeRequests(prodModel, typeToProdData[type][prodModel._id]);
          });
        }

        function assignProdModelToChangeRequests(prodModel, changeRequests)
        {
          _.forEach(changeRequests, function(changeRequest)
          {
            changeRequest.prodModel = prodModel;
          });
        }
      },
      function sendResultsStep(err)
      {
        done(err, {
          totalCount: totalCount,
          collection: prodChangeRequests
        });
      }
    );
  }

  function confirmRoute(req, res, next)
  {
    var newStatus = req.body.status;

    if (newStatus !== 'accepted' && newStatus !== 'rejected')
    {
      return next(express.createHttpError('INPUT', 400));
    }

    var user = req.session.user;
    var userInfo = userModule.createUserInfo(user);

    step(
      function findProdChangeRequestStep()
      {
        ProdChangeRequest.findById(req.params.id).exec(this.next());
      },
      function findPreviousProdChangeRequest(err, prodChangeRequest)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!prodChangeRequest)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        this.prodChangeRequest = prodChangeRequest;

        if (newStatus === 'rejected')
        {
          return;
        }

        var conditions = {
          status: 'new',
          prodLine: prodChangeRequest.prodLine,
          createdAt: {$lt: prodChangeRequest.createdAt}
        };

        ProdChangeRequest.findOne(conditions, {_id: 1}).lean().exec(this.next());
      },
      function executeOperationStep(err, prevProdChangeRequest)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (prevProdChangeRequest)
        {
          return this.skip(express.createHttpError('WRONG_ORDER', 400));
        }

        if (newStatus === 'accepted')
        {
          var prodChangeRequest = this.prodChangeRequest;
          var executeOperation = TYPE_TO_OPERATION[prodChangeRequest.modelType][prodChangeRequest.operation];

          if (prodChangeRequest.operation === 'add')
          {
            executeOperation(user, userInfo, prodChangeRequest.data, this.next());
          }
          else
          {
            executeOperation(user, userInfo, prodChangeRequest.modelId, prodChangeRequest.data, this.next());
          }
        }
      },
      function updateProdChangeRequestStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.prodChangeRequest[newStatus === 'accepted' ? 'accept' : 'reject'](
          userInfo, req.body.confirmerComment, this.next()
        );
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        return res.sendStatus(204);
      }
    );
  }
};

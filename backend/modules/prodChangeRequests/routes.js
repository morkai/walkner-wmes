// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setUpProdChangeRequestsRoutes(app, pcrModule)
{
  const express = app[pcrModule.config.expressId];
  const userModule = app[pcrModule.config.userId];
  const mongoose = app[pcrModule.config.mongooseId];
  const prodShiftsModule = app[pcrModule.config.prodShiftsId];
  const prodShiftOrdersModule = app[pcrModule.config.prodShiftOrdersId];
  const prodDowntimesModule = app[pcrModule.config.prodDowntimesId];
  const fteModule = app[pcrModule.config.fteId];
  const ProdShift = mongoose.model('ProdShift');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const ProdDowntime = mongoose.model('ProdDowntime');
  const ProdChangeRequest = mongoose.model('ProdChangeRequest');

  const TYPE_TO_OPERATION = {
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
    },
    fteMaster: {
      edit: fteModule.editFteMasterEntry
    },
    fteLeader: {
      edit: fteModule.editFteLeaderEntry
    }
  };

  const canView = userModule.auth('LOCAL', 'PROD_DATA:VIEW', 'PROD_DATA:CHANGES:REQUEST');
  const canAdd = userModule.auth('PROD_DATA:CHANGES:REQUEST');
  const canManage = userModule.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:MANAGE');

  express.get('/prodChangeRequests', canView, express.crud.browseRoute.bind(null, app, {
    model: ProdChangeRequest,
    prepareResult: prepareProdChangeRequests
  }));

  express.post('/prodChangeRequests', canAdd, prepareForAdd, express.crud.addRoute.bind(null, app, ProdChangeRequest));

  express.post('/prodChangeRequests/:id', canManage, confirmRoute);

  function prepareProdChangeRequests(totalCount, prodChangeRequests, done)
  {
    const typeToProdData = {
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

      const modelIdToChangeRequestId = typeToProdData[prodChangeRequest.modelType];

      if (!modelIdToChangeRequestId)
      {
        return;
      }

      const modelId = prodChangeRequest.modelId;

      if (!modelIdToChangeRequestId[modelId])
      {
        modelIdToChangeRequestId[modelId] = [];
      }

      modelIdToChangeRequestId[modelId].push(prodChangeRequest);
    });

    step(
      function findRelatedModelsStep()
      {
        const shiftIds = Object.keys(typeToProdData.shift);
        const orderIds = Object.keys(typeToProdData.order);
        const downtimeIds = Object.keys(typeToProdData.downtime);

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

  function prepareForAdd(req, res, next)
  {
    _.assign(req.body, {
      status: 'new',
      createdAt: new Date(),
      creator: userModule.createUserInfo(req.session.user, req)
    });

    next();
  }

  function confirmRoute(req, res, next)
  {
    const newStatus = req.body.status;

    if (newStatus !== 'accepted' && newStatus !== 'rejected')
    {
      return next(express.createHttpError('INPUT', 400));
    }

    const user = req.session.user;
    const userInfo = userModule.createUserInfo(user);

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

        const conditions = {
          status: 'new',
          prodLine: prodChangeRequest.prodLine,
          createdAt: {$lt: prodChangeRequest.createdAt}
        };

        if (prodChangeRequest.modelType === 'fteMaster' || prodChangeRequest.modelType === 'fteLeader')
        {
          conditions['data.subdivision'] = prodChangeRequest.data.subdivision;
        }

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
          const prodChangeRequest = this.prodChangeRequest;
          const executeOperation = TYPE_TO_OPERATION[prodChangeRequest.modelType][prodChangeRequest.operation];

          if (!executeOperation)
          {
            return this.skip(express.createHttpError('INVALID_OPERATION', 400));
          }

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
      function updateProdChangeRequestStep(err, statusCode)
      {
        if (err || statusCode)
        {
          return this.skip(err, statusCode);
        }

        this.prodChangeRequest[newStatus === 'accepted' ? 'accept' : 'reject'](
          userInfo, req.body.confirmerComment, this.next()
        );
      },
      function sendResponseStep(err, statusCode)
      {
        if (!_.isNumber(statusCode))
        {
          statusCode = null;
        }

        if (err)
        {
          if (statusCode)
          {
            err.status = statusCode;
          }

          return next(err);
        }

        return res.sendStatus(statusCode || 204);
      }
    );
  }
};

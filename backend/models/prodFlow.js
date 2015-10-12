// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');

module.exports = function setupProdFlowModel(app, mongoose)
{
  var prodFlowSchema = mongoose.Schema({
    mrpController: [{
      type: 'String',
      ref: 'MrpController'
    }],
    name: {
      type: String,
      trim: true,
      required: true
    },
    deactivatedAt: {
      type: Date,
      default: null
    }
  }, {
    id: false
  });

  prodFlowSchema.statics.TOPIC_PREFIX = 'prodFlows';

  prodFlowSchema.statics.BROWSE_LIMIT = 1000;

  prodFlowSchema.statics.getAllByDivisionId = function(divisionId, done)
  {
    if (!app.subdivisions)
    {
      return done(new Error('MISSING_MODULE'));
    }

    var ProdFlow = this;
    var divisionProdFlows = [];
    var steps = [];

    _.forEach(app.subdivisions.models, function(subdivision)
    {
      if (subdivision.get('division') !== divisionId)
      {
        return;
      }

      var subdivisionId = subdivision.get('_id').toString();

      steps.push(function getAllBySubdivisionIdStep(err)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var next = this.next();

        ProdFlow.getAllBySubdivisionId(subdivisionId, function(err, subdivisionProdFlows)
        {
          if (err)
          {
            return next(err);
          }

          divisionProdFlows = divisionProdFlows.concat(subdivisionProdFlows);

          next();
        });
      });
    });

    steps.push(function(err)
    {
      done(err, divisionProdFlows);
    });

    step(steps);
  };

  prodFlowSchema.statics.getAllBySubdivisionId = function(subdivisionId, done)
  {
    if (!app.mrpControllers || !app.prodFlows)
    {
      return done(new Error('MISSING_MODULE'));
    }

    var prodFlows = [];
    var idMap = {};

    _.forEach(app.mrpControllers.models, function(mrpController)
    {
      if (String(mrpController.subdivision) !== String(subdivisionId))
      {
        return;
      }

      var mrpControllerId = mrpController._id;

      _.forEach(app.prodFlows.models, function(prodFlow)
      {
        var mrpControllers = prodFlow.mrpController;

        if (Array.isArray(mrpControllers)
          && mrpControllers.indexOf(mrpControllerId) !== -1
          && typeof idMap[prodFlow._id] === 'undefined')
        {
          idMap[prodFlow._id] = true;
          prodFlows.push(prodFlow);
        }
      });
    });

    setImmediate(done.bind(null, null, prodFlows));
  };

  mongoose.model('ProdFlow', prodFlowSchema);
};

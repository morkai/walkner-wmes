// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function setupProdFlowModel(app, mongoose)
{
  const prodFlowSchema = new mongoose.Schema({
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

    const ProdFlow = this;
    const steps = [];
    let divisionProdFlows = [];

    _.forEach(app.subdivisions.models, function(subdivision)
    {
      if (subdivision.division !== divisionId)
      {
        return;
      }

      const subdivisionId = subdivision._id.toString();

      steps.push(function getAllBySubdivisionIdStep(err)
      {
        if (err)
        {
          return this.done(done, err);
        }

        const next = this.next();

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

    const prodFlows = [];
    const idMap = {};

    _.forEach(app.mrpControllers.models, function(mrpController)
    {
      if (String(mrpController.subdivision) !== String(subdivisionId))
      {
        return;
      }

      const mrpControllerId = mrpController._id;

      _.forEach(app.prodFlows.models, function(prodFlow)
      {
        const mrpControllers = prodFlow.mrpController;

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

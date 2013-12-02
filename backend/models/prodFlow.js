'use strict';

module.exports = function setupProdFlowModel(app, mongoose)
{
  var prodFlowSchema = mongoose.Schema({
    mrpController: {
      type: 'String',
      ref: 'MrpController',
      required: true
    },
    name: {
      type: String,
      trim: true,
      required: true
    }
  }, {
    id: false
  });

  prodFlowSchema.statics.TOPIC_PREFIX = 'prodFlows';

  prodFlowSchema.statics.BROWSE_LIMIT = 1000;

  prodFlowSchema.statics.getAllByDivisionId = function(divisionId, done)
  {
    if (!app.subdivisions || !app.mrpControllers || !app.prodFlows)
    {
      return done(new Error('MISSING_MODULE'));
    }

    var prodFlows = [];

    app.subdivisions.models.forEach(function(subdivision)
    {
      if (subdivision.get('division') !== divisionId)
      {
        return;
      }

      var subdivisionId = subdivision.get('_id').toString();

      app.mrpControllers.models.forEach(function(mrpController)
      {
        if (String(mrpController.get('subdivision')) !== subdivisionId)
        {
          return;
        }

        var mrpControllerId = mrpController.get('_id');

        app.prodFlows.models.forEach(function(prodFlow)
        {
          if (prodFlow.get('mrpController') === mrpControllerId)
          {
            prodFlows.push(prodFlow);
          }
        });
      });
    });

    setImmediate(done.bind(null, null, prodFlows));
  };

  mongoose.model('ProdFlow', prodFlowSchema);
};

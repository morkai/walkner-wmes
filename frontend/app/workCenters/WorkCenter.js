define([
  '../core/Model',
  'app/data/mrpControllers',
  'app/data/prodFlows'
], function(
  Model,
  mrpControllers,
  prodFlows
) {
  'use strict';

  return Model.extend({

    urlRoot: '/workCenters',

    clientUrlRoot: '#workCenters',

    topicPrefix: 'workCenters',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'workCenters',

    labelAttribute: '_id',

    defaults: {
      mrpController: null,
      prodFlow: null,
      description: null
    },

    getSubdivision: function()
    {
      var mrpController;

      if (this.get('mrpController'))
      {
        mrpController = mrpControllers.get(this.get('mrpController'));
      }
      else
      {
        var prodFlow = prodFlows.get(this.get('prodFlow'));

        if (prodFlow)
        {
          mrpController = mrpControllers.get(prodFlow.get('mrpController'));
        }
      }

      return mrpController ? mrpController.getSubdivision() : null;
    }

  });
});

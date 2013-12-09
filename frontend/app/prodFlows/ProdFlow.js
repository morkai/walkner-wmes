define([
  '../core/Model',
  'app/data/mrpControllers'
], function(
  Model,
  mrpControllers
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodFlows',

    clientUrlRoot: '#prodFlows',

    topicPrefix: 'prodFlows',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodFlows',

    labelAttribute: 'name',

    defaults: {
      mrpController: null,
      name: null
    },

    getSubdivision: function()
    {
      var mrpController = mrpControllers.get(this.get('mrpController'));

      return mrpController ? mrpController.getSubdivision() : null;
    }

  });
});

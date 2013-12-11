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

    parse: function(data)
    {
      if (typeof data.mrpController === 'string')
      {
        data.mrpController = [data.mrpController];
      }
      else if (!Array.isArray(data.mrpController))
      {
        data.mrpController = [];
      }

      return data;
    },

    getSubdivision: function()
    {
      var mrpController = mrpControllers.get(this.get('mrpController')[0]);

      return mrpController ? mrpController.getSubdivision() : null;
    }

  });
});

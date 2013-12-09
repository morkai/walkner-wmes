define([
  '../core/Model',
  '../data/workCenters'
], function(
  Model,
  workCenters
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodLines',

    clientUrlRoot: '#prodLines',

    topicPrefix: 'prodLines',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodLines',

    labelAttribute: '_id',

    defaults: {
      workCenter: null,
      description: null
    },

    getSubdivision: function()
    {
      var workCenter = workCenters.get(this.get('workCenter'));

      return workCenter ? workCenter.getSubdivision() : null;
    }

  });
});

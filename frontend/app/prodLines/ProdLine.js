// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      description: null,
      inventoryNo: null,
      deactivatedAt: null
    },

    getSubdivision: function()
    {
      var workCenter = workCenters.get(this.get('workCenter'));

      return workCenter ? workCenter.getSubdivision() : null;
    }

  });
});

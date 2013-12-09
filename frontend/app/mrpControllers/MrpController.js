define([
  '../core/Model',
  'app/data/subdivisions'
], function(
  Model,
  subdivisions
) {
  'use strict';

  return Model.extend({

    urlRoot: '/mrpControllers',

    clientUrlRoot: '#mrpControllers',

    topicPrefix: 'mrpControllers',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'mrpControllers',

    labelAttribute: '_id',

    defaults: {
      subdivision: null,
      description: null
    },

    getSubdivision: function()
    {
      return subdivisions.get(this.get('subdivision')) || null;
    }

  });
});

// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
      description: null,
      deactivatedAt: null,
      replacedBy: null,
      inout: 0
    },

    getSubdivision: function()
    {
      return subdivisions.get(this.get('subdivision')) || null;
    }

  });
});

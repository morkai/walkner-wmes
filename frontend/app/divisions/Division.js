// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/divisions',

    clientUrlRoot: '#divisions',

    topicPrefix: 'divisions',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'divisions',

    labelAttribute: '_id',

    defaults: {
      type: 'prod',
      description: null
    }

  });
});

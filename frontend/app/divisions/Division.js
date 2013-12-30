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

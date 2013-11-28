define([
  '../core/Model'
], function(
  Model
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
    }

  });
});

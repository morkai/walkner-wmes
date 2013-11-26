define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/prodCenters',

    clientUrlRoot: '#prodCenters',

    topicPrefix: 'prodCenters',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'prodCenters',

    labelAttribute: '_id',

    defaults: {
      description: null
    }

  });
});

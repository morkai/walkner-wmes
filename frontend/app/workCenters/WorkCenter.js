define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/workCenters',

    clientUrlRoot: '#workCenters',

    topicPrefix: 'workCenters',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'workCenters',

    labelAttribute: '_id',

    defaults: {
      mrpController: null,
      prodFlow: null,
      description: null
    }

  });
});

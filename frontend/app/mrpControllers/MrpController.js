define([
  '../core/Model'
], function(
  Model
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
    }

  });
});
